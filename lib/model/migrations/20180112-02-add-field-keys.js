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
  up: async (db) => {
    require('../migrate').patchRaw(db);
    await db.raw(`create table "field_keys" ("actorId" integer, "createdBy" integer not null)`);
    await db.raw(`alter table "field_keys" add constraint "field_keys_pkey" primary key ("actorId")`);
    await db.raw(`alter table "field_keys" add constraint "field_keys_actorid_foreign" foreign key ("actorId") references "actors" ("id")`);
    await db.raw(`alter table "field_keys" add constraint "field_keys_createdby_foreign" foreign key ("createdBy") references "actors" ("id")`);
    await db.raw(`insert into "actees" ("id", "species") values ($1, $2) returning "id"`, uuid(), 'system');
    await db.raw(`insert into "actors" ("acteeId", "displayName", "systemId", "type") values ($1, $2, $3, $4) returning "id"`, uuid(), 'Global Field Keys', 'globalfk', 'system');
    await db.raw(`insert into "grants" ("acteeId", "actorId", "system", "verb") values ($1, $2, $3, $4)`, 'form', '4', 't', 'createSubmission');
    await db.raw(`insert into "actees" ("id", "species") values ($1, $2)`, 'field_key', 'species');
  },
};
