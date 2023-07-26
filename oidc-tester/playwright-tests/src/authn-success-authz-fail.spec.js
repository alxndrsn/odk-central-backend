// Copyright 2023 ODK Central Developers
// See the NOTICE file at the top-level directory of this distribution and at
// https://github.com/getodk/central-backend/blob/master/NOTICE.
// This file is part of ODK Central. It is subject to the license terms in
// the LICENSE file found in the top-level directory of this distribution and at
// https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
// including this file, may be copied, modified, propagated, or distributed
// except according to the terms contained in the LICENSE file.
/* eslint-disable */ // FIXME re-enable lint here

const { test } = require('@playwright/test');

const { frontendUrl } = require('./config');
const {
  assertErrorRedirect,
  assertLoginSuccessful,
  fillLoginForm,
  initTest,
} = require('./utils');

test('successful authN, but user unknown by central', async ({ browserName, page }) => {
  await initTest({ browserName, page });
  await page.goto(`${frontendUrl}/v1/oidc/login`);
  await fillLoginForm(page, { username:'bob', password:'topsecret!!!!!' });
  await assertErrorRedirect(page, 'auth-ok-user-not-found');
});
