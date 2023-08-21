// Copyright 2017 ODK Central Developers
// See the NOTICE file at the top-level directory of this distribution and at
// https://github.com/getodk/central-backend/blob/master/NOTICE.
// This file is part of ODK Central. It is subject to the license terms in
// the LICENSE file found in the top-level directory of this distribution and at
// https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
// including this file, may be copied, modified, propagated, or distributed
// except according to the terms contained in the LICENSE file.

const Problem = require('../util/problem');
const { isBlank, noargs } = require('../util/util');
const { getOrReject, rejectIf } = require('../util/promise');
const { success } = require('../util/http');
const { createUserSession } = require('../util/sessions');
const oidc = require('../util/oidc');

module.exports = (service, endpoint) => {

  if (!oidc.isEnabled()) {
    service.post('/sessions', endpoint(({ Audits, Users, Sessions, bcrypt }, { body, headers }) => {
      // TODO if we're planning to offer multiple authN methods, we should be looking for
      // any calls to bcrypt.verify(), and blocking them if that authN method is not
      // appropriate for the current user.
      //
      // It may be useful to re-use the sessions resources for other authN methods.

      const { email, password } = body;

      if (isBlank(email) || isBlank(password))
        return Problem.user.missingParameters({ expected: [ 'email', 'password' ], got: { email, password } });

      return Users.getByEmail(email)
        .then(getOrReject(Problem.user.authenticationFailed()))
        .then((user) => bcrypt.verify(password, user.password)
          .then(rejectIf(
            (verified) => (verified !== true),
            noargs(Problem.user.authenticationFailed)
          ))
          .then(() => createUserSession({ Audits, Sessions }, headers, user)));
    }));
  }

  service.get('/sessions/restore', endpoint((_, { auth }) =>
    auth.session.orElse(Problem.user.notFound())));

  // here we always throw a 403 even if the token doesn't exist to prevent
  // information leakage.
  // TODO: but a timing attack still exists here. :(
  if (oidc.isEnabled()) {
    service.delete('/sessions/:token', endpoint(({ Sessions }, { auth, params }, req, res) =>
      Sessions.getByBearerToken(params.token)
        .then(getOrReject(Problem.user.insufficientRights()))
        .then((session) => auth.canOrReject('session.end', session.actor)
          .then(() => Sessions.terminate(session))
          .then(() => (_, response) => {
            // revoke the cookie associated w the session, if the session was used to
            // terminate itself.
            // TODO: repetitive w above.
            if (session.token === auth.session.map((s) => s.token).orNull())
              response.cookie('__Host-session', 'null', { path: '/', expires: new Date(0),
                httpOnly: true, secure: true, sameSite: 'strict' });

            return success;
          }))));
  }
};

