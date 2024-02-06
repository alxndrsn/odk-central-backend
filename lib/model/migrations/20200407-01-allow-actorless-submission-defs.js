module.exports = {
  up: (db) => {
    db.raw(`alter table "submission_defs" alter column "actorId" drop default`);
    db.raw(`alter table "submission_defs" alter column "actorId" drop not null`);
    db.raw(`alter table "submission_defs" alter column "actorId" type integer using ("actorId"::integer)`);
  },
};
