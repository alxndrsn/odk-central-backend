module.exports = {
  up: (db) => {
    db.raw(`create table "audits" ("actorId" integer, "action" varchar(16) not null, "acteeId" varchar(36), "details" json, "loggedAt" timestamptz)`);
    db.raw(`alter table "audits" add constraint "audits_actorid_foreign" foreign key ("actorId") references "actors" ("id")`);
    db.raw(`alter table "audits" add constraint "audits_acteeid_foreign" foreign key ("acteeId") references "actees" ("id")`);
    db.raw(`create index "audits_actorid_loggedat_index" on "audits" ("actorId", "loggedAt")`);
    db.raw(`create index "audits_actorid_action_loggedat_index" on "audits" ("actorId", "action", "loggedAt")`);
    db.raw(`create index "audits_action_acteeid_loggedat_index" on "audits" ("action", "acteeId", "loggedAt")`);
    db.raw(`create index "audits_acteeid_loggedat_index" on "audits" ("acteeId", "loggedAt")`);
  },
};
