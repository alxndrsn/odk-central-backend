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
  assertLocation,
  assertLoginSuccessful,
  fillLoginForm,
  initTest,
} = require('./utils'); // eslint-disable-line object-curly-newline

test('can log in with next parameter', async ({ browserName, page }) => {
  // given
  await initTest({ browserName, page });

  // when
  await page.goto(`${frontendUrl}/v1/oidc/login?next=/some/path`);
  await fillLoginForm(page, { username: 'alice', password: 'topsecret!!!!!' });

  // then
  await assertLoginSuccessful(page, '/'); // N.B. backend doesn't receive URL fragments
  await assertLocation(page, frontendUrl + '/#/some/path');
});
