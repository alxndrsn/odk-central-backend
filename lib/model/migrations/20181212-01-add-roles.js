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
    db.raw(`drop table "grants"`);
    db.raw(`create table "roles" ("id" serial primary key, "name" text not null, "system" varchar(8), "createdAt" timestamptz, "updatedAt" timestamptz)`);
    db.raw(`create table "grants" ("roleId" integer not null, "verb" text not null)`);
    db.raw(`alter table "grants" add constraint "grants_pkey" primary key ("roleId", "verb")`);
    db.raw(`alter table "grants" add constraint "grants_roleid_foreign" foreign key ("roleId") references "roles" ("id")`);
    db.raw(`create index "grants_roleid_index" on "grants" ("roleId")`);
    db.raw(`create table "assignments" ("actorId" integer not null, "roleId" integer not null, "acteeId" varchar(36) not null)`);
    db.raw(`alter table "assignments" add constraint "assignments_pkey" primary key ("actorId", "roleId", "acteeId")`);
    db.raw(`alter table "assignments" add constraint "assignments_actorid_foreign" foreign key ("actorId") references "actors" ("id")`);
    db.raw(`alter table "assignments" add constraint "assignments_roleid_foreign" foreign key ("roleId") references "roles" ("id")`);
    db.raw(`alter table "assignments" add constraint "assignments_acteeid_foreign" foreign key ("acteeId") references "actees" ("id")`);
    db.raw(`create index "assignments_actorid_index" on "assignments" ("actorId")`);
  },
};
