// Copyright 2023 ODK Central Developers
// See the NOTICE file at the top-level directory of this distribution and at
// https://github.com/getodk/central-backend/blob/master/NOTICE.
// This file is part of ODK Central. It is subject to the license terms in
// the LICENSE file found in the top-level directory of this distribution and at
// https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
// including this file, may be copied, modified, propagated, or distributed
// except according to the terms contained in the LICENSE file.
/* eslint-disable */

// Have to use modules :shrug:
import Provider from 'oidc-provider';
import fs from 'node:fs';
import https from 'node:https';

const port = 9898;
//const rootUrl = `http://localhost:${port}`;
const rootUrl = process.env.FAKE_OIDC_ROOT_URL || 'https://fake-oidc-server.example.net:9898';

const ACCOUNTS = {
  alex: { email:'alex@example.com', email_verified:true },
};

const pkg = JSON.parse(fs.readFileSync('./package.json', { encoding:'utf8' }));
const log = (...args) => console.error(pkg.name, new Date().toISOString(), 'INFO', ...args);
log.info = log;

const oidc = new Provider(rootUrl, {
  scopes: ['email'],
  claims: { email:['email', 'email_verified'] },

  clients: [{
    client_id: 'odk-central-backend-dev',
    client_secret: 'super-top-secret',
    // TODO can we just always run these, on separate ports?
    redirect_uris: ['http://localhost:8989/v1/oidc/callback', 'https://odk-central.example.org:8989/v1/oidc/callback'],
  }],

  features: {
    resourceIndicators: {
      enabled: true,
      getResourceServerInfo: async (ctx, resourceIndicator, client) => {
        log.info('getResourceServerInfo()', { ctx, resourceIndicator, client });
        return {};
      },
    },
  },

  async findAccount(ctx, id) {
    log.info('findAccount()', { ctx, id });

    const account = ACCOUNTS[id];
    if(!account) return log.info('findAccount() :: not found!');

    const ret = {
      accountId: id,
      async claims(use, scope) {
        log.info('findAccount.claims()', { this:this, use, scope });
        const claims = { sub:id, ...account };
        log.info('findAccount.claims()', 'returning:', claims);
        return claims;
      },
    };
    log.info('findAccount()', 'found:', ret);
    return ret;
  },
});

(async () => {
  if(rootUrl.startsWith('https://')) {
    const key  = fs.readFileSync('../certs/fake-oidc-server.example.net-key.pem', 'utf8');
    const cert = fs.readFileSync('../certs/fake-oidc-server.example.net.pem', 'utf8');
    const httpsServer = https.createServer({ key, cert }, oidc.callback());
    await httpsServer.listen(port);
  } else {
    await oidc.listen(port);
  }
  console.log(`oidc-provider listening on port ${port}, check ${rootUrl}/.well-known/openid-configuration`);
})();

