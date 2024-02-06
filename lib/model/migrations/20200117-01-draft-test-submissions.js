module.exports = {
  up: (db) => {
    db.raw(`alter table "submissions" add column "draft" boolean`);
    db.raw(`create index "submissions_draft_index" on "submissions" ("draft")`);
    db.raw(`update submissions set draft = false`);
    db.raw(`alter table "submissions" alter column "draft" drop default`);
    db.raw(`alter table "submissions" alter column "draft" drop not null`);
    db.raw(`alter table "submissions" alter column "draft" type boolean using ("draft"::boolean)`);
    db.raw(`alter table "submissions" alter column "draft" set not null`);
  },
};
