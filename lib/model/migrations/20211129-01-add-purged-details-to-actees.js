module.exports = {
  up: (db) => {
    db.raw(`alter table "actees" add column "purgedAt" timestamptz, add column "purgedName" text, add column "details" jsonb`);
  },
};
