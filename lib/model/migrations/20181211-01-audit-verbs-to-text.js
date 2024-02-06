module.exports = {
  up: (db) => {
    db.raw(`alter table "audits" alter column "action" drop default`);
    db.raw(`alter table "audits" alter column "action" drop not null`);
    db.raw(`alter table "audits" alter column "action" type text using ("action"::text)`);
    db.raw(`alter table "audits" alter column "action" set not null`);
  },
};
