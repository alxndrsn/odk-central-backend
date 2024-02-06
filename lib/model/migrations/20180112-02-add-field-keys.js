module.exports = {
  up: (db) => {
    db.raw(`create table "field_keys" ("actorId" integer, "createdBy" integer not null)`);
    db.raw(`alter table "field_keys" add constraint "field_keys_pkey" primary key ("actorId")`);
    db.raw(`alter table "field_keys" add constraint "field_keys_actorid_foreign" foreign key ("actorId") references "actors" ("id")`);
    db.raw(`alter table "field_keys" add constraint "field_keys_createdby_foreign" foreign key ("createdBy") references "actors" ("id")`);
    db.raw(`insert into "actees" ("id", "species") values ($1, $2) returning "id"`, '90f58e06-1762-450f-a962-4f25f7edff4d', 'system');
    db.raw(`insert into "actors" ("acteeId", "displayName", "systemId", "type") values ($1, $2, $3, $4) returning "id"`, '90f58e06-1762-450f-a962-4f25f7edff4d', 'Global Field Keys', 'globalfk', 'system');
    db.raw(`insert into "grants" ("acteeId", "actorId", "system", "verb") values ($1, $2, $3, $4)`, 'form', '4', 't', 'createSubmission');
    db.raw(`insert into "actees" ("id", "species") values ($1, $2)`, 'field_key', 'species');
  },
};
