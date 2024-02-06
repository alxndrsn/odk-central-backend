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
    db.raw(`DROP TRIGGER check_field_collisions ON form_fields`);
    db.raw(`ALTER TABLE form_defs DISABLE TRIGGER check_managed_key`);
    db.raw(`create table "form_schemas" ("id" serial primary key)`);
    db.raw(`alter table "form_defs" add column "schemaId" integer`);
    db.raw(`alter table "form_defs" add constraint "form_defs_schemaid_foreign" foreign key ("schemaId") references "form_schemas" ("id")`);
    db.raw(`alter table "form_fields" add column "schemaId" integer`);
    db.raw(`alter table "form_fields" add constraint "form_fields_schemaid_foreign" foreign key ("schemaId") references "form_schemas" ("id") on delete cascade`);
    db.raw(`alter table "ds_property_fields" add column "schemaId" integer`);
    db.raw(`alter table "ds_property_fields" add constraint "ds_property_fields_schemaid_foreign" foreign key ("schemaId") references "form_schemas" ("id") on delete cascade`);
    db.raw(`alter table "ds_property_fields" drop constraint "ds_property_fields_formdefid_path_foreign"`);
    db.raw(`drop index "form_fields_formdefid_binary_index"`);
    db.raw(`drop index "form_fields_formdefid_order_index"`);
    db.raw(`alter table "form_fields" drop constraint "form_fields_pkey"`);
    db.raw(`alter table "form_fields" drop constraint "form_fields_formdefid_foreign"`);
    db.raw(`select "id", "xmlFormId" from "forms"`);
    db.raw(`alter table "form_fields" drop column "formDefId"`);
    db.raw(`alter table "form_fields" add constraint "form_fields_pkey" primary key ("schemaId", "path")`);
    db.raw(`create index "form_fields_schemaid_binary_index" on "form_fields" ("schemaId", "binary")`);
    db.raw(`create index "form_fields_schemaid_order_index" on "form_fields" ("schemaId", "order")`);
    db.raw(`alter table "ds_property_fields" add constraint "ds_property_fields_schemaid_path_foreign" foreign key ("schemaId", "path") references "form_fields" ("schemaId", "path") on delete cascade`);
    db.raw(`alter table "ds_property_fields" add constraint "ds_property_fields_dspropertyid_path_formdefid_unique" unique ("dsPropertyId", "path", "formDefId")`);
    db.raw(`ALTER TABLE form_defs ENABLE TRIGGER check_managed_key`);
  },
};