module.exports = {
  up: (db) => {
    db.raw(`alter table "submissions" add column "submitter" integer`);
    db.raw(`alter table "submissions" add constraint "submissions_submitter_foreign" foreign key ("submitter") references "actors" ("id")`);
  },
};
