module.exports = {
  up: (db) => {
    db.raw(`create table "comments" ("id" serial primary key, "submissionId" integer not null, "actorId" integer not null, "body" text not null, "createdAt" timestamptz)`);
    db.raw(`alter table "comments" add constraint "comments_submissionid_foreign" foreign key ("submissionId") references "submissions" ("id")`);
    db.raw(`alter table "comments" add constraint "comments_actorid_foreign" foreign key ("actorId") references "actors" ("id")`);
    db.raw(`create index "comments_submissionid_index" on "comments" ("submissionId")`);
  },
};
