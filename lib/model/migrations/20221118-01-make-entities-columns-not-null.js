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
    await db.raw(`alter table "datasets" alter column "createdAt" drop default`);
    await db.raw(`alter table "datasets" alter column "createdAt" drop not null`);
    await db.raw(`alter table "datasets" alter column "createdAt" type timestamptz using ("createdAt"::timestamptz)`);
    await db.raw(`alter table "datasets" alter column "createdAt" set not null`);
    await db.raw(`alter table "ds_property_fields" drop constraint "ds_property_fields_dspropertyid_formdefid_path_unique"`);
    await db.raw(`alter table "ds_property_fields" add constraint "ds_property_fields_dspropertyid_formdefid_unique" unique ("dsPropertyId", "formDefId")`);
    await db.raw(`alter table "entities" alter column "createdAt" drop default`);
    await db.raw(`alter table "entities" alter column "createdAt" drop not null`);
    await db.raw(`alter table "entities" alter column "createdAt" type timestamptz using ("createdAt"::timestamptz)`);
    await db.raw(`alter table "entities" alter column "createdAt" set not null`);
    await db.raw(`alter table "entity_defs" alter column "createdAt" drop default`);
    await db.raw(`alter table "entity_defs" alter column "createdAt" drop not null`);
    await db.raw(`alter table "entity_defs" alter column "createdAt" type timestamptz using ("createdAt"::timestamptz)`);
    await db.raw(`alter table "entity_defs" alter column "createdAt" set not null`);
    await db.raw(`alter table "entity_defs" alter column "data" drop default`);
    await db.raw(`alter table "entity_defs" alter column "data" drop not null`);
    await db.raw(`alter table "entity_defs" alter column "data" type jsonb using ("data"::jsonb)`);
    await db.raw(`alter table "entity_defs" alter column "data" set not null`);
    await db.raw(`alter table "entity_defs" add constraint "entity_defs_entityid_submissiondefid_unique" unique ("entityId", "submissionDefId")`);
  },
};
