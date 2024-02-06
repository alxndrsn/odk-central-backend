module.exports = {
  up: (db) => {
    db.raw(`update "audits" set "action" = $1 where "action" = $2`, 'attachment.update', 'update');
    db.raw(`update "audits" set "action" = $1 where "action" = $2`, 'form.create', 'createForm');
    db.raw(`update "audits" set "action" = $1 where "action" = $2`, 'submission.create', 'createSubmission');
  },
};
