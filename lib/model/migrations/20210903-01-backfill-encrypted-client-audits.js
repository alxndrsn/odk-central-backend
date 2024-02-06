module.exports = {
  up: (db) => {
    db.raw(`
        update submission_attachments sa set "isClientAudit"=true
          from submission_defs sd
          where
            sa.name = 'audit.csv.enc' and
            sa."submissionDefId" = sd.id and
            sd."localKey" is not null`);
  },
};
