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

const { redirect } = require('../util/http');
const { createUserSession } = require('../util/sessions');
const {
  CODE_CHALLENGE_METHOD,
  RESPONSE_TYPE,
  SCOPES,
  getClient,
  getRedirectUri,
  isEnabled,
} = require('../util/oidc');

const ONE_HOUR = 60 * 60 * 1000;
// Cannot use __Host- because cookie's Path is set
const CODE_VERIFIER_COOKIE = '__Secure-ocv';

const log = (...args) => console.error('resources/oidc', ...args);

const DEBUG_IDP_RESPONSE = false; // TODO dev-mode setting to understand server response better.  remove option before merge

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

      // TODO should CODE_VERIFIER_COOKIE be stored in the session?  It's implied in the node-openid-client docs:
      //
      // > store the code_verifier in your framework's session mechanism, if it is a cookie based solution
      // > it should be httpOnly (not readable by javascript) and encrypted.
      //
      // However, at this point we probably don't have a session, either on the Express or ODK level.  So TODO confirm
      // if it's OK for this to be bounced to the client and back.

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
  service.get('/oidc/callback', endpoint(async (container, {}, req, res) => { // TODO rename `/callback`?
    const code_verifier = req.cookies[CODE_VERIFIER_COOKIE];

    log('code_verifier:', code_verifier);

    const client = await getClient();

    const params = client.callbackParams(req);
    const tokenSet = await client.callback(getRedirectUri(), params, { code_verifier });
    log('received and validated tokens:', tokenSet);
    log('validated ID Token claims:', tokenSet.claims())

    const { access_token } = tokenSet;

    const userinfo = await client.userinfo(access_token);

    const { email, email_verified } = userinfo;

    // Some providers do not support the email_verified claim.  This may mean either:
    //
    // a) the user's email may or may not have been verified, and the provider may or may not support this [1], or
    // b) the user's email IS verified iff it was supplied [2]
    //
    // [1]: https://developers.onelogin.com/openid-connect/guides/email-verified
    // [2]: https://learn.microsoft.com/en-us/answers/questions/812672/microsoft-openid-connect-getting-verified-email
    if(!config.get('default.oidc.allowUnverifiedEmail') && !email_verified) {
      return emailNotVerified(res, userinfo);
    }

    log('userinfo:', userinfo);

    const user = await getUserByEmail(container, email);
    if(!user) return userNotFound(res, email);

    const session = await initSession(container, req, res, user);

    res.clearCookie(CODE_VERIFIER_COOKIE);

    if(DEBUG_IDP_RESPONSE) {
      return debugIdpResponse(res, session, userinfo);
    }

    return redirect(302, '/'); // REVIEW: internally, the redirect() function throws... which is odd
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

// handy dev function for enabling syntax hilighting of html
function html([ first, ...rest ], ...vars) {
  return first + vars.map((v, idx) => [ v, rest[idx] ]).flat().join('');
}

function userNotFound(res, email) {
  return clientError(res, `Authentication successful, but there is no user in the system with the supplied email address (${email}).`); // TODO reject unauthorized?  or don`t leak info?  etc.
}

function emailNotVerified(res, userinfo) {
  // TODO what should this do?  redirect to login page with a toast informing the user something?

  const { name, email } = userinfo;

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

function debugIdpResponse(res, session, userinfo) {
  const { name, email, picture } = userinfo;

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
          * don't request password from admin when creating new user account
        </pre></div>
        <div><a href="/">Continue to central</a></div>
      </body>
    </html>
  `);
}

async function getUserByEmail({ Users }, email) {
  const userOption = await Users.getByEmail(email);
  if(!userOption.isDefined()) return;

  const user = userOption.get();
  log('got user:', user);

  return user;
}

async function initSession(container, req, res, user) {
  const sessionSetter = await createUserSession(container, req.headers, user);
  log('Created user sessionSetter:', sessionSetter, Object.keys(sessionSetter));
  const session = sessionSetter(req, res);
  log('Created user session:', session);
  return session;
}
