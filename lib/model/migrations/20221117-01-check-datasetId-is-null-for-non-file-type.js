module.exports = {
  up: (db) => {
    db.raw(`ALTER TABLE form_attachments
            ADD CONSTRAINT "check_datasetId_is_null_for_non_file"
            CHECK (("type" = 'file') OR ("datasetId" IS NULL));`);
  },
};
