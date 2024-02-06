module.exports = {
  up: (db) => {
    db.raw(`alter table "sessions" add column "csrf" varchar(64)`);
  },
};
