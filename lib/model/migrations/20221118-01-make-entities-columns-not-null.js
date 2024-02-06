module.exports = {
  up: (db) => {
    db.raw(`alter table "datasets" alter column "createdAt" drop default`);
    db.raw(`alter table "datasets" alter column "createdAt" drop not null`);
    db.raw(`alter table "datasets" alter column "createdAt" type timestamptz using ("createdAt"::timestamptz)`);
    db.raw(`alter table "datasets" alter column "createdAt" set not null`);
    db.raw(`alter table "ds_property_fields" drop constraint "ds_property_fields_dspropertyid_formdefid_path_unique"`);
    db.raw(`alter table "ds_property_fields" add constraint "ds_property_fields_dspropertyid_formdefid_unique" unique ("dsPropertyId", "formDefId")`);
    db.raw(`alter table "entities" alter column "createdAt" drop default`);
    db.raw(`alter table "entities" alter column "createdAt" drop not null`);
    db.raw(`alter table "entities" alter column "createdAt" type timestamptz using ("createdAt"::timestamptz)`);
    db.raw(`alter table "entities" alter column "createdAt" set not null`);
    db.raw(`alter table "entity_defs" alter column "createdAt" drop default`);
    db.raw(`alter table "entity_defs" alter column "createdAt" drop not null`);
    db.raw(`alter table "entity_defs" alter column "createdAt" type timestamptz using ("createdAt"::timestamptz)`);
    db.raw(`alter table "entity_defs" alter column "createdAt" set not null`);
    db.raw(`alter table "entity_defs" alter column "data" drop default`);
    db.raw(`alter table "entity_defs" alter column "data" drop not null`);
    db.raw(`alter table "entity_defs" alter column "data" type jsonb using ("data"::jsonb)`);
    db.raw(`alter table "entity_defs" alter column "data" set not null`);
    db.raw(`alter table "entity_defs" add constraint "entity_defs_entityid_submissiondefid_unique" unique ("entityId", "submissionDefId")`);
  },
};
