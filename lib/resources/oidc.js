// Copyright 2023 ODK Central Developers
// See the NOTICE file at the top-level directory of this distribution and at
// https://github.com/getodk/central-backend/blob/master/NOTICE.
// This file is part of ODK Central. It is subject to the license terms in
// the LICENSE file found in the top-level directory of this distribution and at
// https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
// including this file, may be copied, modified, propagated, or distributed
// except according to the terms contained in the LICENSE file.
/* eslint-disable */

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

// TODO use req.protocol?
const envDomain = config.get('default.env.domain');
const HTTPS_ENABLED = envDomain.startsWith('https://');
const ONE_HOUR = 60 * 60 * 1000;

// Cannot use __Host- because cookie's Path is set
// Use __Secure- in production.  But not in dev - even though firefox will
// support __Secure with localhost, chrome will not.  Note that this behaviour
// is similar but distinct from the Secure attribute, which seems to send
// cookies to http://localhost on both Chrome and FireFox.
// See:
// * https://bugzilla.mozilla.org/show_bug.cgi?id=1648993
// * https://bugs.chromium.org/p/chromium/issues/detail?id=1056543
const CODE_VERIFIER_COOKIE = (HTTPS_ENABLED ? '__Secure-' : '') + 'ocv';
const NEXT_COOKIE          = (HTTPS_ENABLED ? '__Secure-' : '') + 'next';
const callbackCookieProps = {
  httpOnly: true,
  secure: HTTPS_ENABLED,
  sameSite: 'Lax', // allow cookie to be sent on redirect from IdP
  path: '/v1/oidc/callback',
};

const log = (...args) => console.error('resources/oidc', ...args); // FIXME suppress all logs

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
        resource: `${envDomain}/v1`,
        code_challenge,
        code_challenge_method: CODE_CHALLENGE_METHOD,
      });

      res.cookie(CODE_VERIFIER_COOKIE, code_verifier, { ...callbackCookieProps, maxAge:ONE_HOUR });

      const { next } = req.query;
      if(next) res.cookie(NEXT_COOKIE, next, { ...callbackCookieProps, maxAge:ONE_HOUR });

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
  service.get('/oidc/callback', endpoint(async (container, {}, req, res) => {
    try {
      const code_verifier = req.cookies[CODE_VERIFIER_COOKIE];
      const next          = req.cookies[NEXT_COOKIE];

      log('code_verifier:', code_verifier);

      const client = await getClient();

      const params = client.callbackParams(req);
      const tokenSet = await client.callback(getRedirectUri(), params, { code_verifier });
      log('received and validated tokens:', tokenSet);
      log('validated ID Token claims:', tokenSet.claims())

      const { access_token } = tokenSet;

      const userinfo = await client.userinfo(access_token);

      const { email, email_verified } = userinfo;
      if(!email) throw new Error(`Required claim not provided in UserInfo Response: 'email'`);
      if(!email_verified) return emailNotVerified(res, userinfo);

      log('userinfo:', userinfo);

      const user = await getUserByEmail(container, email);
      if(!user) return userNotFound(res, email);

      const session = await initSession(container, req, res, user);

      res.clearCookie(CODE_VERIFIER_COOKIE, callbackCookieProps);
      res.clearCookie(NEXT_COOKIE,          callbackCookieProps);

      if(DEBUG_IDP_RESPONSE) {
        return debugIdpResponse(res, session, userinfo, user);
      }

      log('/oidc/callback', 'Received request headers:', req.headers);
      log('/oidc/callback', 'Sending response headers:', res.getHeaders());

      // This redirect is neat, but breaks SameSite: Secure cookies.
      //return redirect(302, '/'); // REVIEW: internally, the redirect() function throws... which is odd
      // Instead, we need to render a page and then "browse" from that page to the normal frontend:
      // TODO id=cl only set for playwright.. why can't it locate this anchor in any other way?

      // TODO this approach does not work.  Either:
      // 1. expose a browse-to-next page on the frontend, and pass `next` value there, or
      // 2. re-implement
      const nextPath = safeNextPathFrom(next);

      return respond(res, page(
        html`<meta http-equiv="refresh" content="0; url=${nextPath}">`,
        html`
          <h1>Authentication Successful</h1>
          <div><a href="${nextPath}" id="cl">Continue to ODK Central</a></div>
        `,
      ));
    } catch(err) {
      if(redirect.isRedirect(err)) throw err;
      return serverError(res, err);
    }
  }));

  log('OIDC routes initialised.');
};

function serverError(res, err) {
  log(res.path, 'RETURNING ERROR 500', err);
  // FIXME stop returning error details to client
  return respond(res, 500, page(html`
    <h1>Error!</h1>
    <div id="error-message"><pre>${err.message}</pre></div>
    <div><a href="/">Go home</a></div>
  `));
}

function clientError(res, message) {
  log(res.path, 'RETURNING ERROR 400', message);
  // FIXME stop returning error details to client?
  return respond(res, 400, page(html`
    <h1>Error!</h1>
    <div id="error-message"><pre>${message}</pre></div>
    <div><a href="/">Go home</a></div>
  `));
}

function respond(res, status, body, header) {
  if(arguments.length === 2) {
    body = status;
    status = 200;
  }
  res.type('text/html');
  res.status(status);
  res.send(body);
}

// handy dev function for enabling syntax hilighting of html
function html([ first, ...rest ], ...vars) {
  return first + vars.map((v, idx) => [ v, rest[idx] ]).flat().join('');
}

function page(head, body) {
  if(arguments.length === 1) {
    body = head;
    head = '';
  }

  // Style to look like odk-central-frontend
  return html`
    <html>
      <head>
        ${head}
        <style>
          body { margin:0; font-family:"Helvetica Neue", Helvetica, Arial, sans-serif; background-color:#f7f7f7; }
          .header { background-color:#bd006b; color:white; box-shadow: 0 3px 0 #dedede; border-top: 3px solid #8d0050; padding:0.5em 0; }
          .header a,.header a:active,.header a:visited { margin:1em; font-size:12px; font-weight:700; color:white; text-decoration:none; }
          #content { margin:3em auto; width:80%; background-color:white; border-color:rgb(51, 51, 51); box-shadow:rgba(0, 0, 0, 0.25) 0px 0px 24px 0px, rgba(0, 0, 0, 0.28) 0px 35px 115px 0px; }
          #content h1 { background-color:#bd006b; color:white; border-bottom:1px solid #ddd; padding:10px 15px; font-size:18px; margin:0; }
          #content div { border-bottom:1px solid #ddd; padding:10px 15px; }
          #content div:last-child { border-bottom:none; background-color:#eee; }
          #content div:last-child a { background-color:#009ecc; color:white; display:inline-block; padding:6px 10px 5px; border-radius:2px; text-decoration:none; font-size:12px; border-color:#286090; }
          #content div:last-child a:hover { background-color:#0086ad; border-color:#204d74; }
          #content pre { white-space:pre-wrap; }
        </style>
      </head>
      <body>
        <div class="header"><a href="/">ODK Central</a></div>
        <div id="content">
          ${body}
        </div>
      </body>
    </html>
  `;
}

function userNotFound(res, email) {
  return clientError(res, `Authentication successful, but there is no user in the system with the supplied email address (${email}).`); // TODO reject unauthorized?  or don`t leak info?  etc.
}

function emailNotVerified(res, userinfo) {
  // TODO what should this do?  redirect to login page with a toast informing the user something?

  const { name, email } = userinfo;

  const greetingName = name ? `${name} (${email})` : email;

  return respond(res, 403, page(html`
    <h1>Hello, ${greetingName}!</h1>
    <h2 id="error-message">Your email is not verified.</h2>
    <h2>TODO</h2>
    <div><pre>
      * delete session and allow user to retry
    </pre></div>
    <div><a href="/">Go home</a></div>
  `));
}

function debugIdpResponse(res, session, userinfo, user) {
  const { name, email, picture } = userinfo;

  return respond(res, page(html`
    <h1>Hello, ${name} (${email})!</h1>
    <div><h3>Profile picture</h3><img src="${picture}" style="min-width:200px; min-height:200px; border:solid black 1px"/></div>
    <div><h3>User     </h3><code><pre>${JSON.stringify(user,     null, 2)}</pre></code></div>
    <div><h3>Session  </h3><code><pre>${JSON.stringify(session,  null, 2)}</pre></code></div>
    <div><h3>User Info</h3><code><pre>${JSON.stringify(userinfo, null, 2)}</pre></code></div>
    <div>
      <h2>TODO</h2>
      <pre>
        * stop displaying error details to client
        * hide set-password UI
        * don't request password from admin when creating new user account
      </pre>
    </div>
    <div><a href="/">Continue to central</a></div>
  `));
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
function clearCallbackCookie(res, key) {
  res.clearCookie(key, callbackCookieProps);
}
function setCallbackCookie(res, key, value) {
  res.cookie(key, value, callbackCookieProps);
}

// logic from login.vue in frontend
// REVIEW: how can we re-use frontend logic?  E.g. pass as a query string to frontend, and forward there?
function safeNextPathFrom(next) {
  console.log('safeNextPathFrom()', typeof next, next);
  if (!next) return '/#/';

  let url;
  try {
    url = new URL(next, envDomain);
  } catch (e) {
    return '/#/';
  }

  if (url.origin !== envDomain || url.pathname === '/login')
    return '/#/';

  return '/#' + url.pathname + url.search + url.hash;
}
