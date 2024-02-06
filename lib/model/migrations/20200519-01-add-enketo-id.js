module.exports = {
  up: (db) => {
    db.raw(`alter table "forms" add column "enketoId" varchar(255)`);
    db.raw(`alter table "form_defs" add column "enketoId" varchar(255)`);
  },
};
