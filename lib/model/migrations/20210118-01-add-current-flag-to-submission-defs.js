module.exports = {
  up: (db) => {
    db.raw(`alter table "submission_defs" add column "current" boolean`);
    db.raw(`create index "submission_defs_current_index" on "submission_defs" ("current")`);
    db.raw(`create index "submission_defs_submissionid_current_index" on "submission_defs" ("submissionId", "current")`);
    db.raw(`
            update submission_defs
              set current=true
              from (select max(id) as id from submission_defs group by "submissionId")
                as currents
              where submission_defs.id = currents.id`);
  },
};
