module.exports = {
  up: (db) => {
    db.raw(`alter table "actors" alter column "displayName" drop default`);
    db.raw(`alter table "actors" alter column "displayName" drop not null`);
    db.raw(`alter table "actors" alter column "displayName" type varchar(64) using ("displayName"::varchar(64))`);
  },
};
