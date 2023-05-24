// Copyright 2019 ODK Central Developers
// See the NOTICE file at the top-level directory of this distribution and at
// https://github.com/getodk/central-backend/blob/master/NOTICE.
// This file is part of ODK Central. It is subject to the license terms in
// the LICENSE file found in the top-level directory of this distribution and at
// https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
// including this file, may be copied, modified, propagated, or distributed
// except according to the terms contained in the LICENSE file.
/* eslint-disable */

// OpenID settings, algorithms etc.
// Keep an eye on updates to recommendations in case these need updating.
// See: TODO add link to where to get up-to-date recommendations
const CODE_CHALLENGE_METHOD = 'S256'; // S256 PKCE
const RESPONSE_TYPE = 'code';
const SCOPES = ['openid', 'email'];
const TOKEN_SIGNING_ALG = 'RS256';
const TOKEN_ENDPOINT_AUTH_METHOD = 'client_secret_basic';

module.exports = {
  CODE_CHALLENGE_METHOD,
  RESPONSE_TYPE,
  SCOPES,
  getClient,
  getRedirectUri,
  isEnabled,
};

const config = require('config');
const { Issuer } = require('openid-client');

const log = (...args) => console.error('resources/oidc', ...args);

const oidcConfig = config.has('default.oidc') && config.get('default.oidc') || {};

function isEnabled() {
  // This is AN EXPLICIT SETTING rather than derived from e.g. client init
  // failing - we don't want to default to a different authN method to that
  // requested by the system administrator.
  return oidcConfig.enabled === true;
}

function getRedirectUri() {
  return `${config.get('default.env.domain')}/v1/oidc/callback`;
}

let clientLoader; // single instance, initialised lazily
function getClient() {
  if(!clientLoader) clientLoader = initClient();
  return clientLoader;
}
async function initClient() {
  if(!isEnabled()) throw new Error('OIDC is not enabled.');

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
