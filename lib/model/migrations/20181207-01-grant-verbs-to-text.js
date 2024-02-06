module.exports = {
  up: (db) => {
    db.raw(`alter table grants drop constraint grants_pkey`);
    db.raw(`alter table "grants" alter column "verb" drop default`);
    db.raw(`alter table "grants" alter column "verb" drop not null`);
    db.raw(`alter table "grants" alter column "verb" type text using ("verb"::text)`);
    db.raw(`alter table "grants" alter column "verb" set not null`);
    db.raw(`alter table grants add primary key ("actorId", verb, "acteeId")`);
  },
};
