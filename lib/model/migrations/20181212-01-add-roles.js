module.exports = {
  up: (db) => {
    db.raw(`drop table "grants"`);
    db.raw(`create table "roles" ("id" serial primary key, "name" text not null, "system" varchar(8), "createdAt" timestamptz, "updatedAt" timestamptz)`);
    db.raw(`insert into "roles" ("createdAt", "name", "system") values ($1, $2, $3), ($4, $5, $6) returning "id"`, '2024-02-06 12:15:44.673+00', 'Administrator', 'admin', '2024-02-06 12:15:44.673+00', 'App User', 'app_user');
    db.raw(`create table "grants" ("roleId" integer not null, "verb" text not null)`);
    db.raw(`alter table "grants" add constraint "grants_pkey" primary key ("roleId", "verb")`);
    db.raw(`alter table "grants" add constraint "grants_roleid_foreign" foreign key ("roleId") references "roles" ("id")`);
    db.raw(`create index "grants_roleid_index" on "grants" ("roleId")`);
    db.raw(`insert into "grants" ("roleId", "verb") values ($1, $2), ($3, $4), ($5, $6), ($7, $8), ($9, $10), ($11, $12), ($13, $14), ($15, $16), ($17, $18), ($19, $20), ($21, $22), ($23, $24), ($25, $26), ($27, $28), ($29, $30), ($31, $32), ($33, $34), ($35, $36), ($37, $38), ($39, $40), ($41, $42), ($43, $44), ($45, $46), ($47, $48)`, '1', 'backup.create', '1', 'backup.terminate', '1', 'config.read', '1', 'field_key.create', '1', 'field_key.delete', '1', 'field_key.list', '1', 'form.create', '1', 'form.delete', '1', 'form.list', '1', 'form.read', '1', 'form.update', '1', 'project.create', '1', 'project.delete', '1', 'project.read', '1', 'project.update', '1', 'session.end', '1', 'submission.create', '1', 'submission.read', '1', 'submission.list', '1', 'user.create', '1', 'user.list', '1', 'user.password.invalidate', '1', 'user.read', '1', 'user.update');
    db.raw(`insert into "grants" ("roleId", "verb") values ($1, $2), ($3, $4), ($5, $6)`, '2', 'form.list', '2', 'form.read', '2', 'submission.create');
    db.raw(`create table "assignments" ("actorId" integer not null, "roleId" integer not null, "acteeId" varchar(36) not null)`);
    db.raw(`alter table "assignments" add constraint "assignments_pkey" primary key ("actorId", "roleId", "acteeId")`);
    db.raw(`alter table "assignments" add constraint "assignments_actorid_foreign" foreign key ("actorId") references "actors" ("id")`);
    db.raw(`alter table "assignments" add constraint "assignments_roleid_foreign" foreign key ("roleId") references "roles" ("id")`);
    db.raw(`alter table "assignments" add constraint "assignments_acteeid_foreign" foreign key ("acteeId") references "actees" ("id")`);
    db.raw(`create index "assignments_actorid_index" on "assignments" ("actorId")`);
    db.raw(`insert into "assignments" select id as "actorId", $1 as "roleId", '*' as "acteeId" from "actors" where "type" = $2`, '1', 'user');
    db.raw(`select "acteeId" from "projects" where "id" = $1`, '1');
  },
};
