module.exports = {
  up: (db) => {
    db.raw(`alter table "audits" add column "claimed" timestamptz, add column "processed" timestamptz, add column "lastFailure" timestamptz, add column "failures" integer default '0'`);
    db.raw(`create index "audits_claimed_processed_index" on "audits" ("claimed", "processed")`);
    db.raw(`update "audits" set "processed" = $1`, '2024-02-06 12:15:45.213+00');
  },
};
