module.exports = {
  up: (db) => {
    db.raw(`alter table "submission_defs" add column "instanceName" text`);
  },
};
