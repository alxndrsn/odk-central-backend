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
    db.raw(`create table "public_links" ("actorId" integer, "createdBy" integer not null, "formId" integer not null, "once" boolean, "createdAt" timestamptz)`);
    db.raw(`alter table "public_links" add constraint "public_links_pkey" primary key ("actorId")`);
    db.raw(`alter table "public_links" add constraint "public_links_actorid_foreign" foreign key ("actorId") references "actors" ("id")`);
    db.raw(`alter table "public_links" add constraint "public_links_formid_foreign" foreign key ("formId") references "forms" ("id")`);
    db.raw(`alter table "public_links" add constraint "public_links_createdby_foreign" foreign key ("createdBy") references "actors" ("id")`);
  },
};