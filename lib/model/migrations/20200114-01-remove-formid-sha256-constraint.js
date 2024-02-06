module.exports = {
  up: (db) => {
    db.raw(`alter table "form_defs" drop constraint "form_defs_formid_sha256_unique"`);
  },
};
