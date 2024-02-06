module.exports = {
  up: (db) => {
    db.raw(`update "grants" set "acteeId" = $1, "verb" = $2 where "acteeId" = $3 and "verb" = $4`, 'project', 'submission.create', 'form', 'createSubmission');
    db.raw(`update "grants" set "acteeId" = $1, "verb" = $2 where "acteeId" = $3 and "verb" = $4`, 'project', 'form.list', 'form', 'list');
    db.raw(`update "grants" set "acteeId" = $1, "verb" = $2 where "acteeId" = $3 and "verb" = $4`, 'project', 'form.read', 'form', 'read');
  },
};
