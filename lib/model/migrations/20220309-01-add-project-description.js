module.exports = {
  up: (db) => {
    db.raw(`alter table "projects" add column "description" text`);
  },
};
