module.exports = {
  up: (db) => {
    db.raw(`
          update audits
            set
              action = 'submission.attachment.update',
              details = (details - 'blobId') || jsonb_build_object('oldBlobId', details->'blobId')
            where action = 'submission.attachment.clear';`);
  },
};
