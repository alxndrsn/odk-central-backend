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
    db = require('../migrate').patchRaw(db);
    console.log('db:', db);
    console.log('db.raw:', db.raw.toString());
    let i=0;
    await db.raw(`alter table "grants" add column "system" boolean`);
    console.log(++i);
    await db.raw(`alter table "actors" add column "systemId" varchar(8)`);
    console.log(++i);
    await db.raw(`alter table "actors" add constraint "actors_systemid_unique" unique ("systemId")`);

    db.raw(`insert into "actees" ("id", "species") values ('*', 'species'), ('actor', 'species'), ('group', 'species'), ('user', 'species'), ('form', 'species'), ('submission', 'species')`);

    const systemActors = [
      { type: 'system', displayName: 'Administrators', systemId: 'admins' },
      { type: 'system', displayName: 'Anybody', systemId: '*' },
      { type: 'system', displayName: 'All Registered Users', systemId: 'authed' }
    ];

    const res = await Promise.all(systemActors.map(async ({ type, displayName, systemId }) => {
      const acteeId = uuid();
      await db.raw(`insert into "actees" ("id", "species") values ($1, $2) returning "id"`, acteeId, 'system');
      return await db.raw(`insert into "actors" ("acteeId", "displayName", "systemId", "type") values ($1, $2, $3, $4) returning "id"`, acteeId, displayName, systemId, type);
    }));

    const adminId = res[0].rows[0].id;

    await db.raw(`insert into "grants" ("acteeId", "actorId", "system", "verb") values ($1, $2, $3, $4)`, '*', adminId, true, '*');
  },
};
