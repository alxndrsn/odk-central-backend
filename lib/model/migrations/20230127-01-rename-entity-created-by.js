module.exports = {
  up: (db) => {
    db.raw(`alter table "entities" rename "createdBy" to "creatorId"`);
  },
};
