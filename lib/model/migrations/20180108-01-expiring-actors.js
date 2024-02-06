module.exports = {
  up: (db) => {
    db.raw(`alter table "actors" add column "expiresAt" date`);
    db.raw(`alter table "sessions" rename "expires" to "expiresAt"`);
  },
};
