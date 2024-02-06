module.exports = {
  up: (db) => {
    db.raw(`delete from "assignments" where "actorId" in (select "id" from "actors" where "deletedAt" is not null)`);
  },
};
