module.exports = {
  up: (db) => {
    db.raw(`alter table "actors" alter column "expiresAt" drop default`);
    db.raw(`alter table "actors" alter column "expiresAt" drop not null`);
    db.raw(`alter table "actors" alter column "expiresAt" type timestamptz using ("expiresAt"::timestamptz)`);
  },
};
