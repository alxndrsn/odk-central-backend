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
    db.raw(`alter table "entity_defs" alter column "submissionDefId" drop default`);
    db.raw(`alter table "entity_defs" alter column "submissionDefId" drop not null`);
    db.raw(`alter table "entity_defs" alter column "submissionDefId" type integer using ("submissionDefId"::integer)`);
    db.raw(`alter table "entity_defs" drop constraint "entity_defs_submissiondefid_foreign"`);
    db.raw(`alter table "entity_defs" add constraint "entity_defs_submissiondefid_foreign" foreign key ("submissionDefId") references "submission_defs" ("id") on delete SET NULL`);
    db.raw(`alter table "datasets" add column "publishedAt" timestamptz`);
    db.raw(`alter table "ds_properties" add column "publishedAt" timestamptz`);
  },
};
