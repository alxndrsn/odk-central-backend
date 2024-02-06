module.exports = {
  up: (db) => {
    db.raw(`alter table "config" add column "setAt" timestamptz`);
  },
};
