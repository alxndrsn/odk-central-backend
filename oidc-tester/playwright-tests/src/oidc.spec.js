// Copyright 2023 ODK Central Developers
// See the NOTICE file at the top-level directory of this distribution and at
// https://github.com/getodk/central-backend/blob/master/NOTICE.
// This file is part of ODK Central. It is subject to the license terms in
// the LICENSE file found in the top-level directory of this distribution and at
// https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
// including this file, may be copied, modified, propagated, or distributed
// except according to the terms contained in the LICENSE file.
/* eslint-disable */ // FIXME re-enable lint here

const { expect, test } = require('@playwright/test');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cookieParser = require('cookie-parser');

const backendUrl = 'http://localhost:8383';
const port = 8989;
//const frontendUrl = `http//localhost:${port}`;
const frontendUrl = `https://odk-central.example.org:${port}`;
const SESSION_COOKIE = (frontendUrl.startsWith('https://') ? '__Host-' : '') + 'session';

test.use({
  ignoreHTTPSErrors: true,
});

test('can log in with OIDC', async ({ page }) => {
  let fakeFrontend;
  try {
    fakeFrontend = await startFrontendProxy();
    console.log('Setup complete.');

    await page.goto(`${frontendUrl}/v1/oidc/login`);
    await page.locator('input[name=login]').fill('alice');
    await page.locator('input[name=password]').fill('topsecret!!!!');
    await page.locator(`button[type=submit]`).click();
    await page.getByRole('button', { name:'Continue' }).click();

    console.log('Page content:', (await page.locator('html').innerText()).valueOf());

    //console.log('Link content:', (await page.locator('#cl').innerText()).valueOf());
    //await page.locator('#cl').click();

    //await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Page content:', (await page.locator('html').innerText()).valueOf());

    await expect(page.locator('h1')).toHaveText('Success!');

    const requestCookies = JSON.parse(await page.locator(`div[id=request-cookies]`).textContent());

    console.log('requestCookies:', JSON.stringify(requestCookies, null, 2));

    if(!requestCookies[SESSION_COOKIE]) throw new Error('No session cookie found!');
    if(!requestCookies['__csrf'])       throw new Error('No CSRF cookie found!');
  } finally {
    try { fakeFrontend?.close(); } catch(err) { /* :shrug: */ }
  }
});

function html([ first, ...rest ], ...vars) {
  return (`
    <html>
      <body>
        ${first + vars.map((v, idx) => [ v, rest[idx] ]).flat().join('')}
      </body>
    </html>
  `);
}

async function startFrontendProxy() {
  console.log('Starting fake frontend proxy...');
  const fakeFrontend = express();
  fakeFrontend.use(cookieParser());
  fakeFrontend.get('/', (req, res) => {
    console.log('fakeFrontend :: request headers:', req.headers);
    res.send(html`
      <h1>Success!</h1>
      <div id="request-cookies">${JSON.stringify(req.cookies)}</div>
    `);
  });
  fakeFrontend.use(createProxyMiddleware('/v1', { target:backendUrl }));

  if(frontendUrl.startsWith('http://')) {
    await fakeFrontend.listen(port);
    return fakeFrontend;
  } else {
    const fs = require('node:fs');
    const https = require('node:https');
    const key  = fs.readFileSync('../certs/odk-central.example.org-key.pem', 'utf8');
    const cert = fs.readFileSync('../certs/odk-central.example.org.pem', 'utf8');
    const httpsServer = https.createServer({ key, cert }, fakeFrontend);
    await httpsServer.listen(port);
    return httpsServer;
  }
}
