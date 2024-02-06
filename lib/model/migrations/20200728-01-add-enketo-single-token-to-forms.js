module.exports = {
  up: (db) => {
    db.raw(`alter table "forms" add column "enketoOnceId" text`);
  },
};
