// Copyright 2023 ODK Central Developers
// See the NOTICE file at the top-level directory of this distribution and at
// https://github.com/getodk/central-backend/blob/master/NOTICE.
// This file is part of ODK Central. It is subject to the license terms in
// the LICENSE file found in the top-level directory of this distribution and at
// https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
// including this file, may be copied, modified, propagated, or distributed
// except according to the terms contained in the LICENSE file.

const { test } = require('@playwright/test');

const { frontendUrl } = require('./config');
const { // eslint-disable-line object-curly-newline
  assertErrorRedirect,
  fillLoginForm,
  initTest,
} = require('./utils'); // eslint-disable-line object-curly-newline

// eslint-disable-next-line quotes
test(`successful authN, but claim 'email_verified' has value false`, async ({ browserName, page }) => {
  // given
  await initTest({ browserName, page });

  // when
  await page.goto(`${frontendUrl}/v1/oidc/login`);
  await fillLoginForm(page, { username: 'charlie', password: 'topsecret!!!!!' });

  // then
  await assertErrorRedirect(page, 'email-not-verified');
});
