// Copyright 2022 ODK Central Developers
// See the NOTICE file at the top-level directory of this distribution and at
// https://github.com/getodk/central-backend/blob/master/NOTICE.
// This file is part of ODK Central. It is subject to the license terms in
// the LICENSE file found in the top-level directory of this distribution and at
// https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
// including this file, may be copied, modified, propagated, or distributed
// except according to the terms contained in the LICENSE file.

/* eslint-disable */

const assert = require('node:assert');
const fs = require('node:fs');
const should = require('should');

const SUITE_NAME = 'test/e2e/standard';
const log = require('../util/logger')(SUITE_NAME);
const { apiClient, mimetypeFor, Redirect } = require('../util/api');

const serverUrl = 'http://localhost:8383';
const userEmail = 'x@example.com';
const userPassword = 'secret1234';

const attDir = './test-attachments';
const BIGFILE = `${attDir}/big.bin`;

describe('standard', () => {
  let api, projectId, xmlFormId, xmlFormVersion;

  it('should handle weird submission instanceId gracefully', async function() {
    // given
    api = await apiClient(SUITE_NAME, { serverUrl, userEmail, userPassword });
    projectId = await createProject();
    await uploadForm('test-form.xml');
    // TODO upload submission with weird ID
    await uploadSubmission('submission.xml', xmlFormVersion);

    // when
    try {
      await api.apiGet(`projects/${projectId}/forms/${xmlFormId}.svc/Submissions('double:')`);
      assert.fail('expected');
    } catch (err) {
      if (err instanceof assert.AssertionError && err.message === 'expected') throw err;
      assert.equal(err.responseStatus, 404);
      assert.deepEqual(JSON.parse(err.responseText), {
        message: 'Could not find the resource you were looking for.',
        code: 404.1,
      });
    }

    // then
    // assert service has not crashed
    const rootRes = await fetch(serverUrl);
    assert.equal(rootRes.status, 404);
    assert.equal(await rootRes.text(), '{"message":"Expected an API version (eg /v1) at the start of the request URL.","code":404.2}');
  });

  async function createProject() {
    const project = await api.apiPostJson(
      'projects',
      { name:`standard-test-${new Date().toISOString().replace(/\..*/, '')}` },
    );
    return project.id;
  }

  async function uploadForm(xmlFilePath) {
    const res = await api.apiPostFile(`projects/${projectId}/forms?publish=true`, xmlFilePath);
    console.log('form upload result:', JSON.stringify(res));
    xmlFormId = res.xmlFormId;
    xmlFormVersion = res.version;
  }

  async function uploadSubmission(xmlFilePath) {
    const xmlTemplate = fs.readFileSync(xmlFilePath, { encoding: 'utf8' });
    const tempFile = 'TODO-generate-proper-tempfile-name.xml';
    fs.writeFileSync(tempFile, xmlTemplate.replace('{{formVersion}}', xmlFormVersion));
    const res = await api.apiPostFile(`projects/${projectId}/forms/${xmlFormId}/submissions?deviceID=testid`, tempFile);
    console.log('submission upload result:', JSON.stringify(res));
    return res;
  }
});
