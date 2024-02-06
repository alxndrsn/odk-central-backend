module.exports = {
  up: (db) => {
    db.raw(`alter table "entity_defs" alter column "submissionDefId" drop default`);
    db.raw(`alter table "entity_defs" alter column "submissionDefId" drop not null`);
    db.raw(`alter table "entity_defs" alter column "submissionDefId" type integer using ("submissionDefId"::integer)`);
    db.raw(`alter table "entity_defs" drop constraint "entity_defs_submissiondefid_foreign"`);
    db.raw(`alter table "entity_defs" add constraint "entity_defs_submissiondefid_foreign" foreign key ("submissionDefId") references "submission_defs" ("id") on delete SET NULL`);
    db.raw(`alter table "datasets" add column "publishedAt" timestamptz`);
    db.raw(`alter table "ds_properties" add column "publishedAt" timestamptz`);
  },
};
