module.exports = {
  up: (db) => {
    db.raw(`alter table "forms" add column "state" text default 'open'`);
    db.raw(`create index "forms_deletedat_state_index" on "forms" ("deletedAt", "state")`);
    db.raw(`update "forms" set "state" = $1`, 'open');
  },
};
