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
