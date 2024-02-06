module.exports = {
  up: (db) => {
    db.raw(`update forms set version='' where version is null;`);
    db.raw(`alter table "forms" alter column "version" drop default`);
    db.raw(`alter table "forms" alter column "version" drop not null`);
    db.raw(`alter table "forms" alter column "version" type text using ("version"::text)`);
    db.raw(`alter table "forms" alter column "version" set not null`);
  },
};
