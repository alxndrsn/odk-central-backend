// Copyright 2023 ODK Central Developers
// See the NOTICE file at the top-level directory of this distribution and at
// https://github.com/getodk/central-backend/blob/master/NOTICE.
// This file is part of ODK Central. It is subject to the license terms in
// the LICENSE file found in the top-level directory of this distribution and at
// https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
// including this file, may be copied, modified, propagated, or distributed
// except according to the terms contained in the LICENSE file.
/* eslint-disable */ // FIXME re-enable lint here

module.exports = {
  assertErrorShown,
  assertLocation,
  assertLoginSuccessful,
  fillLoginForm,
};

const { expect } = require('@playwright/test');

const { frontendUrl } = require('./config');

const SESSION_COOKIE = (frontendUrl.startsWith('https://') ? '__Host-' : '') + 'session';

async function assertErrorShown(page, expectedErrorMessage) {
  await expect(page.locator('h1')).toHaveText('Error!');
  await expect(page.locator('#content >> div')).toHaveText(expectedErrorMessage);
}

function assertLocation(page, expectedLocation) {
  console.log('  assertLocation()');
  console.log(`   expected: '${expectedLocation}'`);
  return  page.waitForFunction(title => {
    const actualLocation = window.location.href;
    console.log(`\n      actual: ${actualLocation}`);
    return actualLocation === expectedLocation;
  }, expectedLocation);
}

async function assertLoginSuccessful(page) {
  await expect(page.locator('h1')).toHaveText('Success!');

  const requestCookies = JSON.parse(await page.locator(`div[id=request-cookies]`).textContent());

  console.log('requestCookies:', JSON.stringify(requestCookies, null, 2));

  assert(requestCookies[SESSION_COOKIE], 'No session cookie found!');
  assert(requestCookies['__csrf'],       'No CSRF cookie found!');
  assert.equal(Object.keys(requestCookies).length, 2, 'Unexpected requestCookie count!');
}

async function fillLoginForm(page, { username, password }) {
  await page.locator('input[name=login]').fill(username);
  await page.locator('input[name=password]').fill(password);
  await page.locator(`button[type=submit]`).click();
  await page.getByRole('button', { name:'Continue' }).click();
}
