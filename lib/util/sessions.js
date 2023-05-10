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
