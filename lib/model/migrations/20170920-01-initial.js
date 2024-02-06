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
    db.raw(`SELECT 'MIGRATION::20170920-01-initial.js'`);
    db.raw(`create table "forms" ("id" serial primary key, "xmlFormId" varchar(64) not null, "xml" text not null, "createdAt" timestamptz, "updatedAt" timestamptz, "deletedAt" timestamptz)`);
    db.raw(`create index "forms_xmlformid_index" on "forms" ("xmlFormId")`);
    db.raw(`alter table "forms" add constraint "forms_xmlformid_unique" unique ("xmlFormId")`);
    db.raw(`create table "submissions" ("id" serial primary key, "formId" integer not null, "instanceId" varchar(64) not null, "xml" text not null, "createdAt" timestamptz, "updatedAt" timestamptz, "deletedAt" timestamptz)`);
    db.raw(`create index "submissions_formid_index" on "submissions" ("formId")`);
    db.raw(`alter table "submissions" add constraint "submissions_formid_foreign" foreign key ("formId") references "forms" ("id")`);
    db.raw(`create index "submissions_formid_instanceid_index" on "submissions" ("formId", "instanceId")`);
  },
};
