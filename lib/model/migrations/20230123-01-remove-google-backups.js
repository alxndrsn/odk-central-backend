// Copyright 2024 ODK Central Developers
// See the NOTICE file at the top-level directory of this distribution and at
// https://github.com/getodk/central-backend/blob/master/NOTICE.
// This file is part of ODK Central. It is subject to the license terms in
// the LICENSE file found in the top-level directory of this distribution and at
// https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
// including this file, may be copied, modified, propagated, or distributed
// except according to the terms contained in the LICENSE file.

module.exports = {
  up: async (db) => {
    db.raw(`DELETE FROM config WHERE key IN ('backups.main', 'backups.google')`);
    db.raw(`select "id" from "roles" where "system" = $1`, 'initbkup');
    db.raw(`UPDATE actors SET "deletedAt" = now()
        FROM assignments
        WHERE
          assignments."actorId" = actors.id AND
          assignments."roleId" = $1 AND
          actors.type = 'singleUse'`, '4');
    db.raw(`DELETE FROM sessions WHERE "actorId" IN (
          SELECT id FROM actors
          JOIN assignments ON
            assignments."actorId" = actors.id AND
            assignments."roleId" = $1
          WHERE actors.type = 'singleUse'
        )`, '4');
    db.raw(`DELETE FROM assignments WHERE "roleId" = $1`, '4');
    db.raw(`DELETE FROM roles WHERE id = $1`, '4');
  },
};
