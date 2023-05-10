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

const { generators } = require('openid-client');
const config = require('config');

const { createUserSession } = require('../util/sessions');
const { isEnabled, getClient } = require('../util/oidc');

const ONE_HOUR = 60 * 60 * 1000;

// Cannot use __Host- because cookie's Path is set
const CODE_VERIFIER_COOKIE = '__Secure-ocv';

const SCOPES = ['openid', 'email'];
const RESPONSE_TYPE = 'code';

// Algorithms to use.  Keep an eye on updates to recommendations in case these
// need updating.
// See: TODO add link to where to get up-to-date recommendations
const CODE_CHALLENGE_METHOD = 'S256'; // S256 PKCE
const TOKEN_SIGNING_ALG = 'RS256';
const TOKEN_ENDPOINT_AUTH_METHOD = 'client_secret_basic';

const log = (...args) => console.error('resources/oidc', ...args);

module.exports = (service, endpoint) => {
  if(!isEnabled()) {
    log('OIDC not enabled; routes will not be created.');
    return;
  }
  log('Initialising OIDC routes...');

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
      // SameSite: Lax required as cookie needs to be sent when redirected from the IdP
      res.cookie(CODE_VERIFIER_COOKIE, code_verifier, { httpOnly:true, secure:true, sameSite:'Lax', path:'/v1/oidc/callback', maxAge:ONE_HOUR });

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
      const code_verifier = req.cookies[CODE_VERIFIER_COOKIE];

      log('code_verifier:', code_verifier);

      const client = await getClient();

      const params = client.callbackParams(req);
      const tokenSet = await client.callback(getRedirectUri(), params, { code_verifier });
      log('received and validated tokens:', tokenSet);
      log('validated ID Token claims:', tokenSet.claims())

      const { access_token } = tokenSet;

      const userinfo = await client.userinfo(access_token);

      const { email, email_verified, name, picture } = userinfo;

      if(!config.get('default.oidc.allowUnverifiedEmail')) {
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

      const sessionSetter = await createUserSession({ Audits, Sessions }, req.headers, user);
      log('Created user sessionSetter:', sessionSetter, Object.keys(sessionSetter));
      const session = sessionSetter(req, res);
      log('Created user session:', session);

      // TODO clear cookie oidc_code_verifier
      res.clearCookie(CODE_VERIFIER_COOKIE);

      return respond(res, html`
        <html>
          <body>
            <h1>Hello, ${name} (${email})!</h1>
            <div>
              <img src="${picture}"
            </div>
            <div><h3>User     </h3><code><pre>${JSON.stringify(user,     null, 2)}</pre></code></div>
            <div><h3>Session  </h3><code><pre>${JSON.stringify(session,  null, 2)}</pre></code></div>
            <div><h3>User Info</h3><code><pre>${JSON.stringify(userinfo, null, 2)}</pre></code></div>
            <h2>TODO</h2>
            <div><pre>
              * stop displaying error details to client
              * hide set-password UI
              * disable set-password endpoint(s)
              * replace this response with a res.redirect() call
              * don't request password from admin when creating new user account
            </pre></div>
            <div><a href="/">Continue to central</a></div>
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

// handy dev function for enabling syntax hilighting of html
function html([ first, ...rest ], ...vars) {
  return first + vars.map((v, idx) => [ v, rest[idx] ]).flat().join('');
}
