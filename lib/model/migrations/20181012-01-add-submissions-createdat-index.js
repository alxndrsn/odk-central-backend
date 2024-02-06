module.exports = {
  up: (db) => {
    db.raw(`create index "submissions_formid_createdat_index" on "submissions" ("formId", "createdAt")`);
  },
};
