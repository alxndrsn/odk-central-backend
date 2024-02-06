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
  up: async (db) => {
    require('../migrate').patchRaw(db);
    await db.raw(`update actees set species='*' where species='species'`);
    await db.raw(`alter table "actees" add column "parent" varchar(36)`);
    await db.raw(`create index "actees_parent_index" on "actees" ("parent")`);
    await db.raw(`
        update actees set parent=projects."acteeId"
        from forms, projects
        where forms."projectId"=projects.id
          and forms."acteeId"=actees.id`);
    await db.raw(`
        update actees set parent=projects."acteeId"
        from actors, field_keys, projects
        where field_keys."projectId"=projects.id
          and field_keys."actorId"=actors.id
          and actors."acteeId"=actees.id`);
    await db.raw(`
        update actees set parent=forms."acteeId"
        from actors, public_links, forms
        where public_links."formId"=forms.id
          and public_links."actorId"=actors.id
          and actors."acteeId"=actees.id`);
    await db.raw(`insert into "actees" ("id", "species") values ($1, $2)`, 'audit', '*');
  },
};
