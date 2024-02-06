module.exports = {
  up: (db) => {
    db.raw(`
          update audits
            set details = details || jsonb_build_object('instanceId', submissions."instanceId")
            from submissions
            where
              action = 'submission.create' and
              submissions.id::text = details->>'submissionId';`);
  },
};
