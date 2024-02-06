module.exports = {
  up: (db) => {
    db.raw(`create extension if not exists CITEXT`);
    db.raw(`alter table "users" alter column "email" drop default`);
    db.raw(`alter table "users" alter column "email" drop not null`);
    db.raw(`alter table "users" alter column "email" type CITEXT using ("email"::CITEXT)`);
    db.raw(`alter table "users" alter column "email" set not null`);
  },
};
