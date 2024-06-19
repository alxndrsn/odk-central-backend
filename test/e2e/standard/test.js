// Copyright 2022 ODK Central Developers
// See the NOTICE file at the top-level directory of this distribution and at
// https://github.com/getodk/central-backend/blob/master/NOTICE.
// This file is part of ODK Central. It is subject to the license terms in
// the LICENSE file found in the top-level directory of this distribution and at
// https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
// including this file, may be copied, modified, propagated, or distributed
// except according to the terms contained in the LICENSE file.

/* eslint-disable */

const { execSync } = require('node:child_process');
const fs = require('node:fs');
const { randomBytes } = require('node:crypto');
const { basename } = require('node:path');
const _ = require('lodash');
const { program } = require('commander');
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
  let api, projectId, xmlFormId;

  it('should handle weird submission instanceId gracefully', async function() {
    // given
    api = await apiClient(SUITE_NAME, { serverUrl, userEmail, userPassword });
    projectId = await createProject();
    xmlFormId = await uploadForm('test-form.xml');
    // TODO upload submission with weird ID
    await uploadSubmission('submission.xml');

    // when
    // TODO download formName.svc/Submissions(instanceId)

    // then
    // assert service has not crashed
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
    const { xmlFormId } = res;
    return xmlFormId;
  }

  async function uploadSubmission(xmlFilePath) {
    const res = await api.apiPostFile(`projects/${projectId}/forms/${xmlFormId}/submissions?deviceID=testid`, xmlFilePath);
    console.log('submission upload result:', JSON.stringify(res));
    return res;
  }
});
