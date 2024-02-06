module.exports = {
  up: (db) => {
    db.raw(`alter table "submission_defs" add column "root" boolean`);
    db.raw(`update submission_defs set root=true
          where id in (select min(id) from submission_defs group by "submissionId")`);
  },
};
