// Copyright 2023 ODK Central Developers
// See the NOTICE file at the top-level directory of this distribution and at
// https://github.com/getodk/central-backend/blob/master/NOTICE.
// This file is part of ODK Central. It is subject to the license terms in
// the LICENSE file found in the top-level directory of this distribution and at
// https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
// including this file, may be copied, modified, propagated, or distributed
// except according to the terms contained in the LICENSE file.

const up = async (db) => {
  // eslint-disable-next-line quotes
  await db.raw(`CREATE TYPE S3_UPLOAD_STATUS AS ENUM ('pending', 'in_progress', 'uploaded', 'failed')`);
  await db.raw(`
    ALTER TABLE blobs
      ADD COLUMN s3_status S3_UPLOAD_STATUS NOT NULL DEFAULT 'pending',
      ALTER COLUMN content DROP NOT NULL
  `);
};

const down = async (db) => {
  await db.raw(`
    ALTER TABLE blobs
      DROP COLUMN s3_status,
      ALTER COLUMN content SET NOT NULL
  `);
  await db.raw('DELETE TYPE S3_UPLOAD_STATUS');
};

module.exports = { up, down };