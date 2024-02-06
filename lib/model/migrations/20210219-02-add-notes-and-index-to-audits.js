module.exports = {
  up: (db) => {
    db.raw(`alter table "audits" add column "notes" text`);
    db.raw(`create index audits_details_submission_index on audits using gin ((details -> 'submissionId'::text))`);
  },
};
