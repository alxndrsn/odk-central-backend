module.exports = {
  up: (db) => {
    db.raw(`alter table "form_defs" add column "draftToken" varchar(64)`);
  },
};
