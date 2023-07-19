// Copyright 2023 ODK Central Developers
// See the NOTICE file at the top-level directory of this distribution and at
// https://github.com/getodk/central-backend/blob/master/NOTICE.
// This file is part of ODK Central. It is subject to the license terms in
// the LICENSE file found in the top-level directory of this distribution and at
// https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
// including this file, may be copied, modified, propagated, or distributed
// except according to the terms contained in the LICENSE file.
/* eslint-disable */ // FIXME re-enable lint

const { devices } = require('@playwright/test');

const availableProjects = {
  'chrome-desktop', { channel:'chrome' },
  'chrome-mobile':  { ...devices['Pixel 5'] },
  'chromium':       { ...devices['Desktop Chrome'] },
  'edge':           { channel:'msedge' },
  'firefox':        { ...devices['Desktop Firefox'] },
  'safari-mobile':  { ...devices['iPhone 12'] },
  'webkit':         { ...devices['Desktop Safari'] },
};
const requestedBrowsers = process.env.ODK_PLAYWRIGHT_BROWSERS || 'firefox';
const projects = requestedBrowsers
    .split(',')
    .map(name => {
      if(!Object.prototype.hasOwnProperty.call(availableProjects, name)) {
        throw new Error(`No project config available with name '${name}'!`);
      }
      const use = availableProjects[name];
      return { name, use };
    });

/**
 * @see https://playwright.dev/docs/test-configuration
 * @type {import('@playwright/test').PlaywrightTestConfig}
 */
const config = {
  testDir: 'src',
  /* Maximum time one test can run for. */
  timeout: 10 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 2000
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'line',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'https://odk-central.example.org:8989',

    // TODO confirm if required
    ignoreHTTPSErrors: true,

    /* Collect trace when test fails. See https://playwright.dev/docs/trace-viewer */
    trace: 'retain-on-failure',

    screenshot: 'only-on-failure',

    // desperate debug options
    video: 'retain-on-failure',
    headless: true,
  },

  projects,

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  outputDir: 'results/',

  globalSetup: require.resolve('./src/global-setup-teardown'),
};

module.exports = config;
