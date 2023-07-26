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
  assertErrorPage,
  assertErrorRedirect,
  assertLocation,
  assertLoginSuccessful,
  assertTitle,
  fillLoginForm,
  initTest,
};

const assert = require('node:assert');
const { expect } = require('@playwright/test');

const { frontendUrl } = require('./config');

const SESSION_COOKIE = (frontendUrl.startsWith('https://') ? '__Host-' : '') + 'session';

// TODO assert status code?
async function assertErrorPage(page, expectedMessage) {
  await assertTitle(page, 'Error!');
  await expect(page.locator('#error-message')).toHaveText(expectedMessage);
}

async function assertErrorRedirect(page, expectedErrorCode) {
  await page.waitForNavigation(); // TODO required?
  const url = new URL(page.url());
  assert.equal(url.searchParams.get('oidcError'), expectedErrorCode);
}

function assertLocation(page, expectedLocation) {
  console.log('     assertLocation()');
  console.log(`      expected: '${expectedLocation}'`);
  return page.waitForFunction(expectedLocation => {
    const actualLocation = window.location.href;
    console.log(`actual: '${actualLocation}'`);
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

function assertTitle(page, expectedTitle) {
  return expect(page.locator('h1')).toHaveText(expectedTitle);
}

async function fillLoginForm(page, { username, password }) {
  await page.locator('input[name=login]').fill('playwright-' + username);
  await page.locator('input[name=password]').fill(password);
  await page.locator(`button[type=submit]`).click();
  await page.getByRole('button', { name:'Continue' }).click();
}

function initTest({ browserName, page }) {
  console.log(`
    @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    @
    @ Starting test in browser: ${browserName}
    @
    @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  `);

  page.on('console', msg => {
    const level = msg.type().toUpperCase();
    console.log(level, msg.text());
  });
}
