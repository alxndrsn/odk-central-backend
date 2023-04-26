// Copyright 2023 ODK Central Developers
// See the NOTICE file at the top-level directory of this distribution and at
// https://github.com/getodk/central-backend/blob/master/NOTICE.
// This file is part of ODK Central. It is subject to the license terms in
// the LICENSE file found in the top-level directory of this distribution and at
// https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
// including this file, may be copied, modified, propagated, or distributed
// except according to the terms contained in the LICENSE file.

// Allow declaring util functions at the end of the file:
/* eslint-disable no-use-before-define */

// OpenID Connect auth handling using Authorization Code Flow with PKCE.
// TODO document _why_ auth-code-flow, and not e.g. implicit flow?

const { generators } = require('openid-client');
const config = require('config');

const { html } = require('../util/html');
const { redirect } = require('../util/http');
const { createUserSession } = require('../util/sessions');
const { // eslint-disable-line object-curly-newline
  CODE_CHALLENGE_METHOD,
  SCOPES,
  getClient,
  getRedirectUri,
  isEnabled,
} = require('../util/oidc'); // eslint-disable-line camelcase,object-curly-newline

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
const NEXT_COOKIE          = (HTTPS_ENABLED ? '__Secure-' : '') + 'next'; // eslint-disable-line no-multi-spaces
const callbackCookieProps = {
  httpOnly: true,
  secure: HTTPS_ENABLED,
  sameSite: 'Lax', // allow cookie to be sent on redirect from IdP
  path: '/v1/oidc/callback',
};

// FIXME remove logging before merge
// eslint-disable-next-line no-console
const log = (...args) => console.error('resources/oidc', ...args); // FIXME suppress all logs

module.exports = (service, endpoint) => {
  if (!isEnabled()) {
    log('OIDC not enabled; routes will not be created.');
    return;
  }
  log('Initialising OIDC routes...');

  service.get('/oidc/login', endpoint.html(async ({ Sentry }, _, req, res) => {
    try {
      const client = await getClient();
      const code_verifier = generators.codeVerifier(); // eslint-disable-line camelcase

      log('code_verifier:', code_verifier); // eslint-disable-line camelcase

      const code_challenge = generators.codeChallenge(code_verifier); // eslint-disable-line camelcase

      const authUrl = client.authorizationUrl({
        scope: SCOPES.join(' '),
        resource: `${envDomain}/v1`,
        code_challenge,
        code_challenge_method: CODE_CHALLENGE_METHOD,
      });

      res.cookie(CODE_VERIFIER_COOKIE, code_verifier, { ...callbackCookieProps, maxAge: ONE_HOUR });

      const { next } = req.query;
      if (next) res.cookie(NEXT_COOKIE, next, { ...callbackCookieProps, maxAge: ONE_HOUR });

      redirect(307, authUrl);
    } catch (err) {
      Sentry.captureException(err);
      // hack to override the defaultErrorWriter TODO should be fixed elsewhere
      err.isProblem = true;
      throw err;
    }
  }));

  service.get('/oidc/callback', endpoint.html(async (container, _, req, res) => {
    try {
      const code_verifier = req.cookies[CODE_VERIFIER_COOKIE]; // eslint-disable-line camelcase
      const next          = req.cookies[NEXT_COOKIE];          // eslint-disable-line no-multi-spaces
      res.clearCookie(CODE_VERIFIER_COOKIE, callbackCookieProps);
      res.clearCookie(NEXT_COOKIE,          callbackCookieProps); // eslint-disable-line no-multi-spaces

      log('code_verifier:', code_verifier);

      const client = await getClient();

      const params = client.callbackParams(req);
      const tokenSet = await client.callback(getRedirectUri(), params, { code_verifier });
      log('received and validated tokens:', tokenSet);
      log('validated ID Token claims:', tokenSet.claims());

      const { access_token } = tokenSet;

      const userinfo = await client.userinfo(access_token);

      const { email, email_verified } = userinfo;
      if (!email) {
        // eslint-disable-next-line quotes
        container.Sentry.captureException(new Error(`Required claim not provided in UserInfo Response: 'email'`));
        return errorToFrontend(req, res, 'provider-misconfigured');
      }
      if (!email_verified) return errorToFrontend(req, res, 'email-not-verified'); // eslint-disable-line camelcase

      log('userinfo:', userinfo);

      const user = await getUserByEmail(container, email);
      if (!user) return errorToFrontend(req, res, 'auth-ok-user-not-found');

      await initSession(container, req, res, user);

      // This redirect would be ideal, but breaks `SameSite: Secure` cookies.
      // return res.redirect('/');
      // Instead, we need to render a page and then "browse" from that page to the normal frontend:

      const nextPath = safeNextPathFrom(next);

      // id=cl only set for playwright. Why can't it locate this anchor in any other way?
      return {
        head: html`<meta http-equiv="refresh" content="0; url=${nextPath}">`,
        body: html`
          <h1>Authentication Successful</h1>
          <div><a href="${nextPath}" id="cl">Continue to ODK Central</a></div>
        `,
      };
    } catch (err) {
      container.Sentry.captureException(err);
      // hack to override the defaultErrorWriter TODO should be fixed elsewhere
      err.isProblem = true;
      throw err;
    }
  }));

  log('OIDC routes initialised.');
};

function errorToFrontend(req, res, errorCode) {
  const loginUrl = new URL('/#/login', envDomain);

  loginUrl.searchParams.append('oidcError', errorCode);

  const next = req.cookies[NEXT_COOKIE];
  if (next && !Array.isArray(next)) loginUrl.searchParams.append('next', next);

  // REVIEW: here we append query string manually, because Central Frontend expects search/hash in the wrong order:
  const redirectUrl = envDomain + loginUrl.pathname + loginUrl.hash + loginUrl.search;

  redirect(307, redirectUrl);
}

async function getUserByEmail({ Users }, email) {
  const userOption = await Users.getByEmail(email);
  if (!userOption.isDefined()) return;

  const user = userOption.get();
  log('got user:', user);

  return user;
}

async function initSession(container, req, res, user) {
  const applySession = await createUserSession(container, req.headers, user);
  applySession(req, res);
}

// logic from login.vue in frontend
// REVIEW: how can we re-use frontend logic?  E.g. pass as a query string to frontend, and forward there?
function safeNextPathFrom(next) {
  log('safeNextPathFrom()', typeof next, next);
  if (!next) return '/#/';

  let url;
  try {
    url = new URL(next, envDomain);
  } catch (e) {
    return '/#/';
  }

  if (url.origin !== envDomain || url.pathname === '/login')
    return '/#/';

  // Don't modify enketo URLs
  if (url.pathname.startsWith('/-/')) return url.toString();

  // REVIEW: this is similar to code from frontend's src/components/account/login.vue,
  // but its significance is unclear.
  return '/#' + url.pathname + url.search + url.hash;
}
