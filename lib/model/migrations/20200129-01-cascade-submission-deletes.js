module.exports = {
  up: (db) => {
    db.raw(`alter table "submission_defs" drop constraint "submission_defs_submissionid_foreign"`);
    db.raw(`alter table "submission_defs" add constraint "submission_defs_submissionid_foreign" foreign key ("submissionId") references "submissions" ("id") on delete cascade`);
    db.raw(`alter table "submission_attachments" drop constraint "submission_attachments_submissiondefid_foreign"`);
    db.raw(`alter table "submission_attachments" add constraint "submission_attachments_submissiondefid_foreign" foreign key ("submissionDefId") references "submission_defs" ("id") on delete cascade`);
  },
};
