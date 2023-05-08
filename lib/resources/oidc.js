const { Issuer, generators } = require('openid-client');

const config = require('config');

const ONE_HOUR = 60 * 60 * 1000;
const log = (...args) => console.error('resources/oidc', ...args);

module.exports = (service, endpoint) => {
  service.get('/oidc/1', async (req, res, next) => {
    try {
      const client = await getClient();
      const code_verifier = generators.codeVerifier();

      // From node-openid-client docs:
      // > store the code_verifier in your framework's session mechanism, if it is a cookie based solution
      // > it should be httpOnly (not readable by javascript) and encrypted.

      log('code_verifier:', code_verifier);

      const code_challenge = generators.codeChallenge(code_verifier);

      const authUrl = client.authorizationUrl({
        scope: 'openid email profile', // TODO confirm if these are generic, or google-specific and therefore need to be supplied in config
        resource: `${config.get('default.env.domain')}/v1`,
        code_challenge,
        code_challenge_method: 'S256',
      });

      // TODO should this be stored in the session?
      res.cookie('oidc_code_verifier', code_verifier, { httpOnly:true, secure:true, maxAge:ONE_HOUR });

      res.redirect(authUrl);
    } catch(err) {
      log('/1', 'caught error; returning 500', err);
      res.status(500);
    }
  });

  service.get('/oidc/2', async (req, res, next) => {
    try {
      const code_verifier = req.cookies.oidc_code_verifier;

      log('code_verifier:', code_verifier);

      const client = await getClient();

      const params = client.callbackParams(req);
      const tokenSet = await client.callback(getRedirectUri(), params, { code_verifier });
      log('received and validated tokens:', tokenSet);
      log('validated ID Token claims:', tokenSet.claims())

      const { access_token } = tokenSet;
      // TODO check if access_token, email_verified are standard, or google-specific

      const userinfo = await client.userinfo(access_token);

      const { email_verified, given_name, picture } = userinfo;

      if(!oidcConfig.allowUnverifiedEmail) {
        // TODO test this path and make sure the flow is nice.  May be difficult
        // with an actually-unverified email.
        if(!email_verified) {
          res.status(403);
          res.send(html`
            <html>
              <body>
                <h1>Hello, ${given_name}!</h1>
                <h2>Your email is not verified.</h2>
                <h2>TODO</h2>
                <div><pre>
                  * delete session and allow user to retry
                </pre></div>
                <div><a href="/">Try again?</a></div>
              </body>
            </html>
          `);
          return;
        }
      }

      log('userinfo:', userinfo);

      res.send(html`
        <html>
          <body>
            <h1>Hello, ${given_name}!</h1>
            <div>
              <img src="${picture}"
            </div>
            <div><code><pre>${JSON.stringify(userinfo, null, 2)}</pre></code></div>
            <h2>TODO</h2>
            <div><pre>
              * set up the session
              * add two links below:
                1. logout and try again
                2. continue to ODK central
              * add logout handler?  or just use the current one for deleting cookie?
              * stop displaying error details to client
            </pre></div>
            <div><a href="/">Try again?</a></div>
          </body>
        </html>
      `);
    } catch(err) {
      log('/2', 'caught error; returning 500', err);
      res.status(500);
      res.send(html`
        <html>
          <body>
            <h1>Error!</h1>
            <div><pre>${err}</pre></div>
            <div><a href="/">Try again?</a></div>
          </body>
        </html>
      `);
    }
  });
};

function getRedirectUri() {
  return `${config.get('default.env.domain')}/v1/oidc/2`;
}

// TODO this should come from config
const myGoogleConfig = {
  discoveryUrl: 'https://accounts.google.com',
  client_id: '564021877275-o5q3i8j44190d93d9mldd3rti1fncn3u.apps.googleusercontent.com',
  client_secret: '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', // TODO this should come from env var!
};
const oidcConfig = myGoogleConfig;

const clientLoader = (async () => {
  const issuer = await Issuer.discover(oidcConfig.discoveryUrl);
  log('Discovered issuer:', issuer.issuer, issuer.metadata);

  return new issuer.Client({
    // client_id & client_secret are for my test GCP app
    client_id: oidcConfig.client_id,
    client_secret: oidcConfig.client_secret,
    redirect_uris: [getRedirectUri()],
    response_types: ['code'],
    // id_token_signed_response_alg (default "RS256") // TODO what does this refer to, should it be set?
    // token_endpoint_auth_method (default "client_secret_basic") // TODO what does this refer to, should it be set?
  }); // => Client
})();
function getClient() {
  return clientLoader;
}

// handy dev function for enabling syntax hilighting of html
function html([ first, ...rest ], ...vars) {
  return first + vars.map((v, idx) => [ v, rest[idx] ]).flat().join('');
}
