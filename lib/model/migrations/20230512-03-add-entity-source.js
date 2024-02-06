module.exports = {
  up: (db) => {
    db.raw(`create table "entity_def_sources" ("id" serial primary key, "type" varchar(36) not null, "auditId" integer, "submissionDefId" integer, "details" jsonb)`);
    db.raw(`alter table "entity_def_sources" add constraint "entity_def_sources_auditid_foreign" foreign key ("auditId") references "audits" ("id") on delete set null`);
    db.raw(`alter table "entity_def_sources" add constraint "entity_def_sources_submissiondefid_foreign" foreign key ("submissionDefId") references "submission_defs" ("id") on delete set null`);
    db.raw(`alter table "entity_defs" add column "sourceId" integer`);
    db.raw(`alter table "entity_defs" add constraint "entity_defs_sourceid_foreign" foreign key ("sourceId") references "entity_def_sources" ("id")`);
    db.raw(`select "id", "entityId", "submissionDefId" from "entity_defs"`);
    db.raw(`alter table "entity_defs" drop column "submissionDefId"`);
  },
};
