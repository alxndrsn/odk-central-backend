module.exports = {
  up: (db) => {
    db.raw(`alter table "form_defs" drop column "transformationId"`);
    db.raw(`drop table "transformations"`);
  },
};
