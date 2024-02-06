module.exports = {
  up: (db) => {
    db.raw(`select * from "actors" where "systemId" = $1`, 'globalfk');
    db.raw(`insert into "grants" ("acteeId", "actorId", "system", "verb") values ($1, $2, $3, $4), ($5, $6, $7, $8)`, 'form', '4', 't', 'list', 'form', '4', 't', 'read');
  },
};
