module.exports = {
  up: (db) => {
    db.raw(`CREATE TYPE S3_UPLOAD_STATUS AS ENUM ('pending', 'in_progress', 'uploaded', 'failed')`);
    db.raw(`
            ALTER TABLE blobs
              ADD COLUMN s3_status S3_UPLOAD_STATUS NOT NULL DEFAULT 'pending',
              ALTER COLUMN content DROP NOT NULL
          `);
  },
};
