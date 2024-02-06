module.exports = {
  up: (db) => {
    db.raw(`alter table "submissions" add column "deviceId" varchar(255)`);
  },
};
