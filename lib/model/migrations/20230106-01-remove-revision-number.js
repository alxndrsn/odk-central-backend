module.exports = {
  up: (db) => {
    db.raw(`alter table "datasets" drop column "revisionNumber"`);
  },
};
