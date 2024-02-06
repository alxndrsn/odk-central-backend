module.exports = {
  up: (db) => {
    db.raw(`alter table actors drop constraint actors_type_check`);
    db.raw(`alter table "actors" alter column "type" drop default`);
    db.raw(`alter table "actors" alter column "type" drop not null`);
    db.raw(`alter table "actors" alter column "type" type varchar(15) using ("type"::varchar(15))`);
  },
};
