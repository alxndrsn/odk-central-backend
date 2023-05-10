// Copyright 2019 ODK Central Developers
// See the NOTICE file at the top-level directory of this distribution and at
// https://github.com/getodk/central-backend/blob/master/NOTICE.
// This file is part of ODK Central. It is subject to the license terms in
// the LICENSE file found in the top-level directory of this distribution and at
// https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
// including this file, may be copied, modified, propagated, or distributed
// except according to the terms contained in the LICENSE file.

module.exports = { createUserSession };

const Problem = require('../util/problem');
const { isBlank, noargs } = require('../util/util');
const { getOrReject, rejectIf } = require('../util/promise');
const { success } = require('../util/http');

function createUserSession({ Audits, Sessions }, headers, user) {
  return Promise.all([
    Sessions.create(user.actor),
    // Logging here rather than defining Sessions.create.audit, because
    // Sessions.create.audit would require auth. Logging here also makes
    // it easy to access `headers`.
    Audits.log(user.actor, 'user.session.create', user.actor, {
      userAgent: headers['user-agent']
    })
  ])
  .then(([ session ]) => (_, response) => {
    response.cookie('__Host-session', session.token, { path: '/', expires: session.expiresAt,
      httpOnly: true, secure: true, sameSite: 'strict' });
    response.cookie('__csrf', session.csrf, { expires: session.expiresAt,
      secure: true, sameSite: 'strict' });

    return session;
  });
}
