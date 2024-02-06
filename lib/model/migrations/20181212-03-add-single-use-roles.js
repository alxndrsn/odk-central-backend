// Copyright 2024 ODK Central Developers
// See the NOTICE file at the top-level directory of this distribution and at
// https://github.com/getodk/central-backend/blob/master/NOTICE.
// This file is part of ODK Central. It is subject to the license terms in
// the LICENSE file found in the top-level directory of this distribution and at
// https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
// including this file, may be copied, modified, propagated, or distributed
// except according to the terms contained in the LICENSE file.

module.exports = {
  down: () => { throw new Error('down() not yet supported for this migration'); },
  up: (db) => {
    db.raw(`insert into "roles" ("createdAt", "name", "system") values (NOW(), $1, $2), (NOW(), $4, $5) returning "id"`, 'Password Reset Token', 'pwreset', 'Backups Verification Token', 'initbkup');
    db.raw(`insert into "grants" ("roleId", "verb") values ($1, $2)`, '3', 'user.password.reset');
    db.raw(`insert into "grants" ("roleId", "verb") values ($1, $2)`, '4', 'backup.verify');
  },
};
