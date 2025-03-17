// Copyright 2024 ODK Central Developers
// See the NOTICE file at the top-level directory of this distribution and at
// https://github.com/getodk/central-backend/blob/master/NOTICE.
// This file is part of ODK Central. It is subject to the license terms in
// the LICENSE file found in the top-level directory of this distribution and at
// https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
// including this file, may be copied, modified, propagated, or distributed
// except according to the terms contained in the LICENSE file.

const assert = require('node:assert');
const fs = require('node:fs');

const SUITE_NAME = 'test/e2e/standard';
const { apiClient } = require('../util/api');

const serverUrl = 'http://localhost:8383';
const userEmail = 'x@example.com';
const userPassword = 'secret1234';

describe.only('Cache headers', () => {
  const undici = require('undici');

  // TODO increase max-age to 1 and add 2 seconds of sleep - maybe undici never caches max-age 0 at all?
  // TODO check stashed stuff

  let api;
  let projectId = ':projectId';
  let xmlFormId = ':xmlFormId';
  let xmlFormVersion = ':xmlFormVersion';

  before(async () => {
    // given
    api = await apiClient(SUITE_NAME, { serverUrl, userEmail, userPassword });
    projectId = await createProject(api);
    // and
    const form = await uploadForm(api, projectId, 'test-form.xml');
    xmlFormId = form.xmlFormId;
    xmlFormVersion = form.version;
    // and
    await uploadSubmission(api, projectId, xmlFormId, xmlFormVersion, 'cache-test-submission');
  });

  describe('private paths', () => {
    [
      () => `${serverUrl}/v1/projects/${projectId}`,
      //() => `${serverUrl}/v1/projects/${projectId}/forms/${encodeURIComponent(xmlFormId)}`,
      //() => `${serverUrl}/v1/projects/${projectId}/forms/${encodeURIComponent(xmlFormId)}.svc/Submissions('cache-test-submission')`,
    ].forEach(url => {
      `
        inputs                                                     || expected outputs
        with cache | has session header | has etag | after max-age || response status | different date
        -----------|--------------------|----------|---------------||-----------------|---------------
                ❌ |                 ❌ |       ❌ |            ❌ || 403             | ❌
                ❌ |                 ❌ |       ❌ |            ✅ || 403             | ❌
                ❌ |                 ❌ |       ✅ |            ❌ || 403             | ❌
                ❌ |                 ❌ |       ✅ |            ✅ || 403             | ❌
                ❌ |                 ✅ |       ❌ |            ❌ || 200             | ❌
                ❌ |                 ✅ |       ❌ |            ✅ || 200             | ❌
                ❌ |                 ✅ |       ✅ |            ❌ || 200             | ❌
                ❌ |                 ✅ |       ✅ |            ✅ || 200             | ❌
            shared |                 ❌ |       ❌ |            ❌ || 403             | ❌
            shared |                 ❌ |       ❌ |            ✅ || 403             | ❌
            shared |                 ❌ |       ✅ |            ❌ || 403             | ❌
            shared |                 ❌ |       ✅ |            ✅ || 403             | ❌
            shared |                 ✅ |       ❌ |            ❌ || 200             | ❌
            shared |                 ✅ |       ❌ |            ✅ || 200             | ✅
            shared |                 ✅ |       ✅ |            ❌ || 200             | ❌
            shared |                 ✅ |       ✅ |            ✅ || 200             | ❌
           private |                 ❌ |       ❌ |            ❌ || 403             | ❌
           private |                 ❌ |       ❌ |            ✅ || 403             | ❌
           private |                 ❌ |       ✅ |            ❌ || 403             | ❌
           private |                 ❌ |       ✅ |            ✅ || 403             | ❌
           private |                 ✅ |       ❌ |            ❌ || 200             | ❌
           private |                 ✅ |       ❌ |            ✅ || 200             | ✅
           private |                 ✅ |       ✅ |            ❌ || 304             | ❌
           private |                 ✅ |       ✅ |            ✅ || 304             | ❌
      `.split('\n')
        .filter((line, idx) => line.trim() && idx > 3)
        .filter(line => !line.match(/^\s*(--|\/\/|#)/)) // TODO remove comment filter
        .map(line => console.log({ line, parts: line.split(/\s*\|+\s*/) }) || line // TODO remove console.log()
          .trim()
          .split(/\s*\|+\s*/)
          .map(str => {
            if (str === '✅') return true;
            if (str === '❌') return false;
            return str;
          }))
        .forEach(([ cache, useSession, useEtag, useSleep, expectedStatus, expectDifferentDate ]) => {
          it.only(`should return ${expectedStatus} when ${JSON.stringify({ cache, useSession, useEtag, useSleep })}`, async function() {
            this.timeout(5000);

            const dispatcher = (() => {
              switch (cache) {
                case 'private': return new undici.Agent().compose(undici.interceptors.cache({
                  cacheByDefault: undefined, // do not cache responses without explicit expiration
                  methods: [ 'GET' ],
                  type: 'private',
                }));
                case 'shared': return new undici.Agent().compose(undici.interceptors.cache({
                  cacheByDefault: Number.MAX_SAFE_INTEGER, // aggressively cache everything
                  methods: [ 'GET' ],
                  type: 'shared',
                }));
                case false: return;
                default: throw new Error(`Unrecognised cache option '${cache}'`);
              }
            })();

            const baseOpts = {
              dispatcher,
              // N.B. base caching headers are set to work around "helpful" fetch behaviour.  These
              // overrides may make these tests behave less like browsers, which may be of
              // significance if trying to tune real-world client behaviour for odk-central-frontend
              // users.
              // See: https://github.com/nodejs/undici/issues/1930
              headers: {
                'Cache-Control': '',
                'Pragma': '',
              },
            };

            const withSessionHeader = (opts={}) => ({
              ...opts,
              headers: { ...opts.headers, Authorization:`Bearer ${api.getSessionToken()}` },
            });

            const withEtagFrom = (res, opts={}) => ({ ...opts, headers: { ...opts.headers, 'If-None-Match': res.headers.get('ETag') } });

            // TODO filtering some variables here while working out expected values
            //if(cache !== 'private') return;
            //if(useSleep) return;
            //if(useEtag) return;
            //if(useSession) return;

            // given
            console.log('--- req1 -----------------------');
            let opts1 = withSessionHeader(baseOpts);
            console.log('res1 opts:', opts1);
            const res1 = await undici.fetch(url(), opts1);
            console.log('res1:', res1.status, res1.headers);
            assertOkStatus(res1);
            // and
            console.log('--- req2 -----------------------');
            let opts2 = baseOpts;
            if (useEtag)    opts2 = withEtagFrom(res1, opts2);
            if (useSession) opts2 = withSessionHeader(opts2);

            // when
            if (useSleep) await sleep(2000);
            // and
            console.log('res2 opts:', opts2);
            const res2 = await undici.fetch(url(), opts2);
            console.log('res2:', res2.status, res2.headers);

            // then
            assert.equal(res2.status, Number(expectedStatus), `Expected response status ${expectedStatus}, but got ${res2.status}`);
            if (expectDifferentDate) assert.notEqual(res2.headers.get('date'), res1.headers.get('date'));
            // and
            assert.equal(res1.headers.get('Cache-Control'), 'private, max-age=1'); // TODO change this to max-age=0 and decrease sleep to 1s
            assert.equal(res2.headers.get('Cache-Control'), 'private, max-age=1');
            assert.equal(res1.headers.get('Expires'), undefined);
            assert.equal(res2.headers.get('Expires'), undefined);
          });
        });
      });
  });

  describe('single-use paths', () => {
    [
      () => `${serverUrl}/v1/sessions/restore`,
    ].forEach(url => {
      it(`should NOT cache ${url()} in a private cache`, async function() {
        this.timeout(10000);

        // given
        const res1 = await undici.fetch(url(), withPrivateCache(withSessionHeader()));
        assertOkStatus(res1);

        // when
        const res2 = await undici.fetch(url(), withPrivateCache());
        // then
        assertNonOkStatus(res2);

        // when
        await sleep(2000);
        const res3 = await undici.fetch(url(), withPrivateCache(withSessionHeader()));
        // then
        assertOkStatus(res3);
        assert.notEqual(res3.headers.get('date'), res1.headers.get('date'));

        // and
        assert.equal(res1.headers.get('Cache-Control'), 'no-store');
        assert.equal(res2.headers.get('Cache-Control'), 'no-store');
        assert.equal(res3.headers.get('Cache-Control'), 'no-store');
        assert.equal(res1.headers.get('Expires'), undefined);
        assert.equal(res2.headers.get('Expires'), undefined);
        assert.equal(res3.headers.get('Expires'), undefined);
      });

      it(`should NOT cache ${url()} in a shared cache`, async function() {
        this.timeout(10000);

        // given
        const res1 = await undici.fetch(url(), withSharedCache(withSessionHeader()));
        assertOkStatus(res1);

        // when
        const res2 = await undici.fetch(url(), withSharedCache());
        // then
        assertNonOkStatus(res2);

        // when
        await sleep(2000);
        const res3 = await undici.fetch(url(), withSharedCache(withSessionHeader()));
        // then
        assertOkStatus(res3);
        assert.notEqual(res3.headers.get('date'), res1.headers.get('date'));

        // and
        assert.equal(res1.headers.get('Cache-Control'), 'no-store');
        assert.equal(res2.headers.get('Cache-Control'), 'no-store');
        assert.equal(res3.headers.get('Cache-Control'), 'no-store');
        assert.equal(res1.headers.get('Expires'), undefined);
        assert.equal(res2.headers.get('Expires'), undefined);
        assert.equal(res3.headers.get('Expires'), undefined);
      });
    });
  });
});

describe('#1157 - Backend crash when opening hostile-named submission detail', () => {
  let api, projectId, xmlFormId, xmlFormVersion; // eslint-disable-line one-var, one-var-declaration-per-line

  it('should handle weird submission instanceId gracefully', async () => {
    // given
    api = await apiClient(SUITE_NAME, { serverUrl, userEmail, userPassword });
    projectId = await createProject(api);
    // and
    const form = await uploadForm(api, projectId, 'test-form.xml');
    xmlFormId = form.xmlFormId;
    xmlFormVersion = form.version;
    // and
    const goodSubmissionId = 'good-id';
    await uploadSubmission(api, projectId, xmlFormId, xmlFormVersion, goodSubmissionId);

    // expect 200:
    await api.apiGet(`projects/${projectId}/forms/${encodeURIComponent(xmlFormId)}.svc/Submissions('${goodSubmissionId}')`);

    // given
    const badSubmissionId = 'bad-id:';
    await uploadSubmission(api, projectId, xmlFormId, xmlFormVersion, badSubmissionId);
    // when
    await assert.rejects(
      () => api.apiGet(`projects/${projectId}/forms/${encodeURIComponent(xmlFormId)}.svc/Submissions('${badSubmissionId}')?%24select=__id%2C__system%2Cmeta`),
      (err) => {
        // then
        assert.strictEqual(err.responseStatus, 404);
        assert.deepStrictEqual(JSON.parse(err.responseText), {
          message: 'Could not find the resource you were looking for.',
          code: 404.1,
        });
        return true;
      },
    );

    // and service has not crashed:
    const rootRes = await fetch(serverUrl);
    assert.strictEqual(rootRes.status, 404);
    assert.strictEqual(await rootRes.text(), '{"message":"Expected an API version (eg /v1) at the start of the request URL.","code":404.2}');
  });
});

async function createProject(api) {
  const project = await api.apiPostJson(
    'projects',
    { name:`standard-test-${new Date().toISOString().replace(/\..*/, '')}` },
  );
  return project.id;
}

function uploadForm(api, projectId, xmlFilePath) {
  return api.apiPostFile(`projects/${projectId}/forms?publish=true`, xmlFilePath);
}

function uploadSubmission(api, projectId, xmlFormId, xmlFormVersion, submissionId) {
  const xmlTemplate = fs.readFileSync('submission.xml', { encoding: 'utf8' });
  const formXml = xmlTemplate
    .replace('{{submissionId}}', submissionId)
    .replace('{{formId}}', xmlFormId)
    .replace('{{formVersion}}', xmlFormVersion);

  return api.apiPostFile(`projects/${projectId}/forms/${encodeURIComponent(xmlFormId)}/submissions?deviceID=testid`, {
    body: formXml,
    mimeType: 'application/xml',
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms)); // eslint-disable-line no-promise-executor-return
}

function assertOkStatus({ ok, status }) {
  assert.equal(ok, true, `Expected OK response status, but got ${status}`);
}

function assertNonOkStatus({ ok, status }) {
  assert.equal(ok, false, `Expected non-OK response status, but got ${status}`);
}
