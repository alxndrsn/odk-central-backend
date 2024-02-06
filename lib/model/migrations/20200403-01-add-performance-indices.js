module.exports = {
  up: (db) => {
    db.raw(`create index "submission_defs_submissionid_index" on "submission_defs" ("submissionId")`);
  },
};
