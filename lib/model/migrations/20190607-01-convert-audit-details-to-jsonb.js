module.exports = {
  up: (db) => {
    db.raw(`alter table "audits" alter column "details" drop default`);
    db.raw(`alter table "audits" alter column "details" drop not null`);
    db.raw(`alter table "audits" alter column "details" type jsonb using ("details"::jsonb)`);
  },
};
