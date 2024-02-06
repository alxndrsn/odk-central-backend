module.exports = {
  up: (db) => {
    db.raw(`DROP INDEX public.submissions_draft_index;`);
    db.raw(`DROP INDEX public.submissions_formid_index;`);
    db.raw(`DROP INDEX public.submissions_formid_instanceid_index;`);
    db.raw(`DROP INDEX public.submissions_formid_createdat_index;`);
    db.raw(`CREATE INDEX submissions_formid_createdat_id_index ON public.submissions USING btree ("formId", "createdAt", id);`);
    db.raw(`DROP INDEX public.submission_defs_createdat_index;`);
    db.raw(`DROP INDEX public.submission_defs_current_index;`);
    db.raw(`DROP INDEX public.submission_defs_id_submissionid_index;`);
    db.raw(`DROP INDEX public.submission_defs_submissionid_index;`);
    db.raw(`CREATE INDEX submission_defs_createdat_id_index ON public.submission_defs USING btree ("createdAt", id);`);
  },
};
