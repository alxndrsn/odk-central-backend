module.exports = {
  up: (db) => {
    db.raw(`alter table "forms" drop column "name"`);
  },
};
