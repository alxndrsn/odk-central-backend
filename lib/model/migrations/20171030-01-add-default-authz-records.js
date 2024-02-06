// Copyright 2024 ODK Central Developers
// See the NOTICE file at the top-level directory of this distribution and at
// https://github.com/getodk/central-backend/blob/master/NOTICE.
// This file is part of ODK Central. It is subject to the license terms in
// the LICENSE file found in the top-level directory of this distribution and at
// https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
// including this file, may be copied, modified, propagated, or distributed
// except according to the terms contained in the LICENSE file.
//

const uuid = require('uuid').v4;

module.exports = {
  down: () => { throw new Error('down() not yet supported for this migration'); },
  up: (db) => {
    db.raw(`alter table "grants" add column "system" boolean`);
    db.raw(`alter table "actors" add column "systemId" varchar(8)`);
    db.raw(`alter table "actors" add constraint "actors_systemid_unique" unique ("systemId")`);
    db.raw(`insert into "actees" ("id", "species") values ($1, $2), ($3, $4), ($5, $6), ($7, $8), ($9, $10), ($11, $12)`, '*', 'species', 'actor', 'species', 'group', 'species', 'user', 'species', 'form', 'species', 'submission', 'species');
    db.raw(`insert into "actees" ("id", "species") values ($1, $2) returning "id"`, uuid(), 'system');
    db.raw(`insert into "actees" ("id", "species") values ($1, $2) returning "id"`, uuid(), 'system');
    db.raw(`insert into "actees" ("id", "species") values ($1, $2) returning "id"`, uuid(), 'system');
    db.raw(`insert into "actors" ("acteeId", "displayName", "systemId", "type") values ($1, $2, $3, $4) returning "id"`, uuid(), 'Administrators', 'admins', 'system');
    db.raw(`insert into "actors" ("acteeId", "displayName", "systemId", "type") values ($1, $2, $3, $4) returning "id"`, uuid(), 'Anybody', '*', 'system');
    db.raw(`insert into "actors" ("acteeId", "displayName", "systemId", "type") values ($1, $2, $3, $4) returning "id"`, uuid(), 'All Registered Users', 'authed', 'system');
    db.raw(`insert into "grants" ("acteeId", "actorId", "system", "verb") values ($1, $2, $3, $4)`, '*', '1', 't', '*');
  },
};
