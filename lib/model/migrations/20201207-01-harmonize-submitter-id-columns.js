module.exports = {
  up: (db) => {
    db.raw(`alter table "submission_defs" rename "actorId" to "submitterId"`);
  },
};
