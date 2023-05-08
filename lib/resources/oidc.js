const { Issuer, generators } = require('openid-client');

const ONE_HOUR = 60 * 60 * 1000;

const log = (...args) => console.error('resources/oidc', ...args);

module.exports = (service, endpoint) => {
  service.get('/oidc/1', async (req, res, next) => {
    try {
      const client = await getClient();
      const code_verifier = generators.codeVerifier();
      // store the code_verifier in your framework's session mechanism, if it is a cookie based solution
      // it should be httpOnly (not readable by javascript) and encrypted.

      log('code_verifier:', code_verifier);

      const code_challenge = generators.codeChallenge(code_verifier);

      const authUrl = client.authorizationUrl({
        scope: 'openid email profile',
        resource: 'http://localhost:8989/v1',
        code_challenge,
        code_challenge_method: 'S256',
      });

      // TODO should this be stored in the session?
      res.cookie('oidc_code_verifier', code_verifier, { httpOnly:true, secure:true, maxAge:ONE_HOUR });

      res.redirect(authUrl);
    } catch(err) {
      log('resources/oidc', 'caught error; returning 500', err);
      res.status(500);
    }
  });
};

const clientLoader = (async () => {
  const googleIssuer = await Issuer.discover('https://accounts.google.com');
  log('Discovered issuer %s %O', googleIssuer.issuer, googleIssuer.metadata);

  return new googleIssuer.Client({
    client_id: 'zELcpfANLqY7Oqas',
    client_secret: 'TQV5U29k1gHibH5bx1layBo0OSAvAbRT3UYW3EWrSYBB5swxjVfWUa1BS8lqzxG/0v9wruMcrGadany3',
    redirect_uris: ['http://localhost:8989/oidc/2'],
    response_types: ['code'],
    // id_token_signed_response_alg (default "RS256")
    // token_endpoint_auth_method (default "client_secret_basic")
  }); // => Client
})();
function getClient() {
  return clientLoader;
}
