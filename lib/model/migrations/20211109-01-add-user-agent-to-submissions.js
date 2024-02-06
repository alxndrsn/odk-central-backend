module.exports = {
  up: (db) => {
    db.raw(`alter table "submission_defs" add column "userAgent" varchar(255), add column "deviceId" varchar(255)`);
    db.raw(`update submission_defs set "deviceId"=submissions."deviceId"
            from submissions
            where submissions.id=submission_defs."submissionId"
              and submission_defs.id in (select min(id) from submission_defs group by "submissionId")`);
  },
};
