// Copyright 2019 ODK Central Developers
// See the NOTICE file at the top-level directory of this distribution and at
// https://github.com/getodk/central-backend/blob/master/NOTICE.
// This file is part of ODK Central. It is subject to the license terms in
// the LICENSE file found in the top-level directory of this distribution and at
// https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
// including this file, may be copied, modified, propagated, or distributed
// except according to the terms contained in the LICENSE file.

// OpenID Connect auth handling using Authorization Code Flow with PKCE.
// TODO document _why_ auth-code-flow, and not e.g. implicit flow?

const { Issuer, generators } = require('openid-client');
const { createUserSession } = require('../util/sessions');

const config = require('config');

const ONE_HOUR = 60 * 60 * 1000;

const SCOPES = ['openid', 'email','profile'];
const RESPONSE_TYPE = 'code';

// Algorithms to use.  Keep an eye on updates to recommendations in case these
// need updating.
// See: TODO add link to where to get up-to-date recommendations
const CODE_CHALLENGE_METHOD = 'S256'; // S256 PKCE
const TOKEN_SIGNING_ALG = 'RS256';
const TOKEN_ENDPOINT_AUTH_METHOD = 'client_secret_basic';

const log = (...args) => console.error('resources/oidc', ...args);

module.exports = (service, endpoint) => {
  service.get('/oidc/login', async (req, res) => {
    try {
      const client = await getClient();
      const code_verifier = generators.codeVerifier();

      log('code_verifier:', code_verifier);

      const code_challenge = generators.codeChallenge(code_verifier);

      const authUrl = client.authorizationUrl({
        scope: SCOPES.join(' '),
        resource: `${config.get('default.env.domain')}/v1`,
        code_challenge,
        code_challenge_method: CODE_CHALLENGE_METHOD,
      });

      // TODO should this be stored in the session?  It's implied in the node-openid-client docs:
      // > store the code_verifier in your framework's session mechanism, if it is a cookie based solution
      // > it should be httpOnly (not readable by javascript) and encrypted.
      res.cookie('oidc_code_verifier', code_verifier, { httpOnly:true, secure:true, maxAge:ONE_HOUR });

      res.redirect(authUrl); // looks like this would break some expectation of endpoint() managing headers
    } catch(err) {
      return serverError(res, err);
    }
  });

  // FIXME we need to use endpoint() to give access to Audits,Sessions,Users, but there seems to be something
  // it expects to be responsible for in the response lifecycle, causing:
  //
  //   Error: The resource returned no data. This is likely a developer problem.
  //
  // Still, things seem to work anyway.
  service.get('/oidc/callback', endpoint(async ({ Audits, Sessions, Users }, {}, req, res) => { // TODO rename `/callback`?
    try {
      const code_verifier = req.cookies.oidc_code_verifier;

      log('code_verifier:', code_verifier);

      const client = await getClient();

      const params = client.callbackParams(req);
      const tokenSet = await client.callback(getRedirectUri(), params, { code_verifier });
      log('received and validated tokens:', tokenSet);
      log('validated ID Token claims:', tokenSet.claims())

      const { access_token } = tokenSet;

      const userinfo = await client.userinfo(access_token);

      const { email, email_verified, name, picture } = userinfo;

      if(!oidcConfig.allowUnverifiedEmail) {
        // Some providers do not support the email_verified claim.  This may mean either:
        //
        // a) the user's email may or may not have been verified, and the provider may or may not support this [1], or
        // b) the user's email IS verified iff it was supplied [2]
        //
        // [1]: https://developers.onelogin.com/openid-connect/guides/email-verified
        // [2]: https://learn.microsoft.com/en-us/answers/questions/812672/microsoft-openid-connect-getting-verified-email
        if(!email_verified) {
          return respond(res, 403, html`
            <html>
              <body>
                <h1>Hello, ${name} (${email})!</h1>
                <h2>Your email is not verified.</h2>
                <h2>TODO</h2>
                <div><pre>
                  * delete session and allow user to retry
                </pre></div>
                <div><a href="/">Try again?</a></div>
              </body>
            </html>
          `);
        }
      }

      log('userinfo:', userinfo);

      const userOption = await Users.getByEmail(email);
      if(!userOption.isDefined()) {
        return clientError(res, `Authentication successful, but there is no user in the system with the supplied email address (${email}).`); // TODO reject unauthorized?  or don`t leak info?  etc.
      }
      const user = userOption.get();

      log('got user:', user);
      // TODO handle user not found - does it throw?  or null user?
      const sessionSetter = await createUserSession({ Audits, Sessions }, req.headers, user);
      console.log('Created user sessionSetter:', sessionSetter, Object.keys(sessionSetter));
      const session = sessionSetter(req, res);
      console.log('Created user session:', session);

      // TODO clear cookie oidc_code_verifier

      return respond(res, html`
        <html>
          <body>
            <script>
              function tryRestoreSession() {
                alert('TODO implement me');
                // Trick vue into thinking the session has definitely NOT
                // expired.  It should get overwritten after restoreSession()
                // completes anyway.
                localStorage.setItem('sessionExpires', Date.now() + 999999999);
              }
            </script>
            <h1>Hello, ${name} (${email})!</h1>
            <div>
              <img src="${picture}"
            </div>
            <div><h3>User     </h3><code><pre>${JSON.stringify(user,     null, 2)}</pre></code></div>
            <div><h3>Session  </h3><code><pre>${JSON.stringify(session,  null, 2)}</pre></code></div>
            <div><h3>User Info</h3><code><pre>${JSON.stringify(userinfo, null, 2)}</pre></code></div>
            <h2>TODO</h2>
            <div><pre>
              * set up the session
              * add two links below:
                1. logout and try again
                2. continue to ODK central
              * add logout handler?  or just use the current one for deleting cookie?
              * stop displaying error details to client
              * hide set-password UI
              * disable set-password endpoint(s)
            </pre></div>
            <div><a onclick="tryRestoreSession()" href="#">Try to "restore" the session?</a></div>
            <div><a href="/">Try again?</a></div>
          </body>
        </html>
      `);
    } catch(err) {
      return serverError(res, err);
    }
  }));
};

function serverError(res, err) {
  log(res.path, 'RETURNING ERROR 500', err);
  // FIXME stop returning error details to client
  return respond(res, 500, html`
    <html>
      <body>
        <h1>Error!</h1>
        <div><pre>${err}</pre></div>
        <div><a href="/">Try again?</a></div>
      </body>
    </html>
  `);
}

function clientError(res, message) {
  log(res.path, 'RETURNING ERROR 400', message);
  // FIXME stop returning error details to client?
  return respond(res, 400, html`
    <html>
      <body>
        <h1>Error!</h1>
        <div><pre>${message}</pre></div>
        <div><a href="/">Try again?</a></div>
      </body>
    </html>
  `);
}

function respond(res, status, body) {
  if(arguments.length === 2) {
    body = status;
    status = 200;
  }
  res.status(status);
  res.send(body);
}

function getRedirectUri() {
  return `${config.get('default.env.domain')}/v1/oidc/callback`;
}

// TODO this should come from config
// from https://console.cloud.google.com/apis/credentials
const myGoogleConfig = {
  discoveryUrl: 'https://accounts.google.com',
  clientId: '564021877275-o5q3i8j44190d93d9mldd3rti1fncn3u.apps.googleusercontent.com',
  clientSecret: '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', // TODO this should come from env var!
};
// from https://openidconnect.net
const myAuth0Config = {
  discoveryUrl: 'https://odk-oidc-dev.us.auth0.com',
  clientId: 'ZKKpcW8TpKymVLbD1dbDVExj7SU4Zxbn',
  clientSecret: '7tuVT7OsjRHfmUiwYYyWNT8YArMNlmvvv70tqlChkjtVHW0Xsp0mvVAyKIfCgUn5',
  allowUnverifiedEmail: true, // personal setting in dev - a bit inconvenient at the moment to verify emails
};
// fiddle with this config to test out different init failure modes
const nonsenseConfig = {
  discoveryUrl: 'http://example.com',
  clientId: 'this is required; should be reported during client init if this line commented out',
  clientSecret: 'this is required; should be reported during client init if this line commented out',
};
const oidcConfig = myAuth0Config;

const clientLoader = (async () => {
  try {
    assertHasAll('config keys', Object.keys(oidcConfig), ['discoveryUrl', 'clientId', 'clientSecret']);

    const { discoveryUrl } = oidcConfig;
    log('Attempting discovery from:', discoveryUrl);
    const issuer = await Issuer.discover(discoveryUrl);
    log('Discovered issuer:', issuer.issuer, issuer.metadata);

    const {
      code_challenge_methods_supported,
      id_token_signing_alg_values_supported,
      response_types_supported,
      scopes_supported,
      token_endpoint_auth_methods_supported,
    } = issuer.metadata;

    assertHasAll('scopes', scopes_supported, SCOPES);
    assertHas('response type',              response_types_supported,              RESPONSE_TYPE);
    assertHas('code challenge method',      code_challenge_methods_supported,      CODE_CHALLENGE_METHOD);
    assertHas('token signing alg',          id_token_signing_alg_values_supported, TOKEN_SIGNING_ALG);
    assertHas('token endpoint auth method', token_endpoint_auth_methods_supported, TOKEN_ENDPOINT_AUTH_METHOD);

    return new issuer.Client({
      client_id:      oidcConfig.clientId,
      client_secret:  oidcConfig.clientSecret,
      redirect_uris:  [getRedirectUri()],
      response_types: [RESPONSE_TYPE],
      id_token_signed_response_alg: TOKEN_SIGNING_ALG,
      token_endpoint_auth_method: TOKEN_ENDPOINT_AUTH_METHOD,
    }); // => Client
  } catch(err) {
    // N.B. don't include the config here - it might include the client secret, perhaps in the wrong place.
    throw new Error(`Failed to configure OpenID Connect client: ${err}`);
  }
})();
function getClient() {
  return clientLoader;
}

// handy dev function for enabling syntax hilighting of html
function html([ first, ...rest ], ...vars) {
  return first + vars.map((v, idx) => [ v, rest[idx] ]).flat().join('');
}

function assertHas(name, actual, required) {
  if(!actual.includes(required)) {
    throw new Error(`Missing required ${name}.  Wanted: ${required}, but got ${actual}!`);
  }
}

function assertHasAll(name, actual, required) {
  if(!required.every(v => actual.includes(v))) {
    throw new Error(`Missing required ${name}.  Wanted: ${required}, but got ${actual}!`);
  }
}
