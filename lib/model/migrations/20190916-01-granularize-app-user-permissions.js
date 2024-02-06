// Copyright 2024 ODK Central Developers
// See the NOTICE file at the top-level directory of this distribution and at
// https://github.com/getodk/central-backend/blob/master/NOTICE.
// This file is part of ODK Central. It is subject to the license terms in
// the LICENSE file found in the top-level directory of this distribution and at
// https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
// including this file, may be copied, modified, propagated, or distributed
// except according to the terms contained in the LICENSE file.

module.exports = {
  up: (db) => {
    db.raw(`alter table "field_keys" add column "projectId" integer`);
    db.raw(`alter table "field_keys" add constraint "field_keys_projectid_foreign" foreign key ("projectId") references "projects" ("id")`);
    db.raw(`create index "field_keys_actorid_projectid_index" on "field_keys" ("actorId", "projectId")`);
    db.raw(`
            update field_keys set "projectId" = projects.id
              from assignments, projects
              where assignments."actorId" = field_keys."actorId"
                and projects."acteeId" = assignments."acteeId";
          `);
    db.raw(`
            insert into assignments ("actorId", "roleId", "acteeId")
              select
                  assignments."actorId",
                  (select id from roles where system = 'app_user'),
                  forms."acteeId"
                from roles
                inner join assignments on assignments."roleId" = roles.id
                inner join projects on projects."acteeId" = assignments."acteeId"
                inner join forms on forms."projectId" = projects.id
                where roles.system = 'app_user';
          `);
    db.raw(`
            delete from assignments
              using projects, field_keys
              where assignments."acteeId" = projects."acteeId"
                and assignments."actorId" = field_keys."actorId";
          `);
  },
};
