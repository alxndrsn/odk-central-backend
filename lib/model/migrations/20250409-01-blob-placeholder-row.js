// Copyright 2025 ODK Central Developers
// See the NOTICE file at the top-level directory of this distribution and at
// https://github.com/getodk/central-backend/blob/master/NOTICE.
// This file is part of ODK Central. It is subject to the license terms in
// the LICENSE file found in the top-level directory of this distribution and at
// https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
// including this file, may be copied, modified, propagated, or distributed
// except according to the terms contained in the LICENSE file.


const zeros = n => ''.padStart(n, '0');

const up = async (db) => {
  await db.raw(`CREATE TYPE S3_UPLOAD_STATUS_V2 AS ENUM ('pending', 'uploaded', 'failed', 'placeholder')`);

  // TODO add tests to make sure existing blobs maintain existing status
  await db.raw(`
    ALTER TABLE blobs
      ALTER COLUMN s3_status DROP DEFAULT,
      ALTER COLUMN s3_status TYPE S3_UPLOAD_STATUS_V2 USING s3_status::text::S3_UPLOAD_STATUS_V2,
      ALTER COLUMN s3_status SET DEFAULT 'pending'::S3_UPLOAD_STATUS_V2
  `);

  await db.raw(`DROP TYPE S3_UPLOAD_STATUS`);
  await db.raw(`ALTER TYPE S3_UPLOAD_STATUS_V2 RENAME TO S3_UPLOAD_STATUS`);

  await db.raw(`
    INSERT INTO
      blobs (id, s3_status,     sha,          md5)
      VALUES(-1, 'placeholder', ${zeros(40)}, ${zeros(32)})
  `);

  await db.raw(`UPDATE submission_attachments SET "blobId"=-1    WHERE "blobId"    IS NULL`);
  await db.raw(`UPDATE form_attachments       SET "blobId"=-1    WHERE "blobId"    IS NULL`);
  await db.raw(`UPDATE form_defs              SET "xlsBlobId"=-1 WHERE "xlsBlobId" IS NULL`);
  await db.raw(`ALTER TABLE  submission_attachments ALTER COLUMN "blobId"    SET DEFAULT -1, ALTER COLUMN "blobId"    SET NOT NULL`);
  await db.raw(`ALTER TABLE  form_attachments       ALTER COLUMN "blobId"    SET DEFAULT -1, ALTER COLUMN "blobId"    SET NOT NULL`);
  await db.raw(`ALTER TABLE  form_defs              ALTER COLUMN "xlsBlobId" SET DEFAULT -1, ALTER COLUMN "xlsBlobId" SET NOT NULL`);



  // 2. for each table:
  //  ALTER TABLE X ALTER COLUMN Y SET NOT NULL, ALTER COLUMN Y SET DEFAULT -1;

};

const down = async () => {
};

module.exports = { up, down };
