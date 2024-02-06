module.exports = {
  up: (db) => {
    db.raw(`alter table "forms" add column "name" text, add column "version" text, add column "hash" text`);
  },
};
