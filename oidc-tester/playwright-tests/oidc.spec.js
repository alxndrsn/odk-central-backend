const { expect, test } = require('@playwright/test');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cookieParser = require('cookie-parser');

const backendUrl = 'http://localhost:8383';
const port = 8989;
//const frontendUrl = `http//localhost:${port}`;
const frontendUrl = `https://odk-central.example.org:${port}`;

test.use({
  ignoreHTTPSErrors: true,
});

test('can log in with OIDC', async ({ page }) => {
  let fakeFrontend;
  try {
    fakeFrontend = await startFrontendProxy();
    console.log('Setup complete.');

    await page.goto(`${frontendUrl}/v1/oidc/login`);
    await page.locator('input[name=login]').fill('alex');
    await page.locator('input[name=password]').fill('topsecret!!!!');
    await page.locator(`button[type=submit]`).click();
    await page.getByRole('button', { name:'Continue' }).click();

    await expect(page.locator('h1')).toHaveText('Success!');

    const requestCookies = JSON.parse(await page.locator(`div[id=request-cookies]`).textContent());

    console.log(JSON.stringify(requestCookies, null, 2));

    if(!requestCookies.session) throw new Error('No session cookie found!');
    if(!requestCookies.__csrf)  throw new Error('No CSRF cookie found!');

    // TODO there are limitations to this test - some of the most fiddly stuff
    // WRT cookie settings are around Secure, SameSite, __Host, __Secure, but
    // we may not be able to fully test this without both HTTPS and a non-
    // localhost domain.  Perhaps testable in docker with a self-signed cert
    // and host-file remapping?
    // See: https://web.dev/when-to-use-local-https/#when-to-use-https-for-local-development
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
    const key  = fs.readFileSync('/odk-central-backend/certs/odk-central.example.org-key.pem', 'utf8');
    const cert = fs.readFileSync('/odk-central-backend/certs/odk-central.example.org.pem', 'utf8');
    const httpsServer = https.createServer({ key, cert }, fakeFrontend);
    await httpsServer.listen(port);
    return httpsServer;
  }
}
