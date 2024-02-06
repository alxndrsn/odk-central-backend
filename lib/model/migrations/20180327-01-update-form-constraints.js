module.exports = {
  up: (db) => {
    db.raw(`create unique index forms_xmlformid_deletedat_unique on forms ("xmlFormId") where "deletedAt" is null;`);
    db.raw(`alter table "forms" drop constraint "forms_xmlformid_unique"`);
    db.raw(`alter table "forms" add constraint "forms_xmlformid_version_unique" unique ("xmlFormId", "version")`);
  },
};
