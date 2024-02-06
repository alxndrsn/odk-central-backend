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
    db.raw(`create table "projects" ("id" serial primary key, "name" text not null, "acteeId" varchar(36) not null, "createdAt" timestamptz, "updatedAt" timestamptz, "deletedAt" timestamptz)`);
    db.raw(`alter table "projects" add constraint "projects_acteeid_unique" unique ("acteeId")`);
    db.raw(`alter table "forms" add column "projectId" integer`);
    db.raw(`insert into "actees" ("id", "species") values ($1, $2)`, 'project', 'species');
    db.raw(`select count(*) from "forms" limit $1`, '1');
    db.raw(`alter table "forms" alter column "projectId" drop default`);
    db.raw(`alter table "forms" alter column "projectId" drop not null`);
    db.raw(`alter table "forms" alter column "projectId" type integer using ("projectId"::integer)`);
    db.raw(`alter table "forms" alter column "projectId" set not null`);
    db.raw(`alter table "forms" add constraint "forms_projectid_foreign" foreign key ("projectId") references "projects" ("id")`);
    db.raw(`alter table "forms" drop constraint "forms_xmlformid_version_unique"`);
    db.raw(`alter table "forms" add constraint "forms_xmlformid_version_projectid_unique" unique ("xmlFormId", "version", "projectId")`);
    db.raw(`drop index forms_xmlformid_deletedat_unique`);
    db.raw(`create unique index forms_projectid_xmlformid_deletedat_unique on forms ("projectId", "xmlFormId") where "deletedAt" is null;`);
  },
};
