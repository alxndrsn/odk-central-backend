module.exports = {
  up: (db) => {
    db.raw(`alter table "users" drop column "updatedAt"`);
  },
};
