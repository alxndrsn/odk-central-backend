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
    await db.raw(`create table "entity_def_sources" ("id" serial primary key, "type" varchar(36) not null, "auditId" integer, "submissionDefId" integer, "details" jsonb)`);
    await db.raw(`alter table "entity_def_sources" add constraint "entity_def_sources_auditid_foreign" foreign key ("auditId") references "audits" ("id") on delete set null`);
    await db.raw(`alter table "entity_def_sources" add constraint "entity_def_sources_submissiondefid_foreign" foreign key ("submissionDefId") references "submission_defs" ("id") on delete set null`);
    await db.raw(`alter table "entity_defs" add column "sourceId" integer`);
    await db.raw(`alter table "entity_defs" add constraint "entity_defs_sourceid_foreign" foreign key ("sourceId") references "entity_def_sources" ("id")`);
    await db.raw(`select "id", "entityId", "submissionDefId" from "entity_defs"`);
    await db.raw(`alter table "entity_defs" drop column "submissionDefId"`);
  },
};
