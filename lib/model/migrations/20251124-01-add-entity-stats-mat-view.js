// Copyright 2025 ODK Central Developers
// See the NOTICE file at the top-level directory of this distribution and at
// https://github.com/getodk/central-backend/blob/master/NOTICE.
// This file is part of ODK Central. It is subject to the license terms in
// the LICENSE file found in the top-level directory of this distribution and at
// https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
// including this file, may be copied, modified, propagated, or distributed
// except according to the terms contained in the LICENSE file.

const up = db => db.raw(`
  CREATE MATERIALIZED VIEW entity_stats AS
    SELECT "datasetId"
         , COUNT(*) AS "entities"
         , MAX("createdAt") AS "lastEntity"
         , COUNT(*) FILTER (WHERE conflict IS NOT NULL) AS "conflicts"
      FROM entities
      WHERE "deletedAt" IS NULL
      GROUP BY "datasetId"
    WITH NO DATA;
  CREATE UNIQUE INDEX entity_stats_datasetid_idx ON entity_stats ("datasetId");
  REFRESH MATERIALIZED VIEW entity_stats;

  CREATE OR REPLACE FUNCTION refresh_entity_stats() RETURNS void AS $$
    DECLARE
      -- Big random number which hints at being used for "estats"
      lock_id CONSTANT bigint := 3574750035747500357475;
      lock_acquired boolean;
    BEGIN
      -- Prevent simultaneous refreshes of the view.
      -- Fail fast if lock is not available - refresh later if there's a slow one in progress.
      lock_acquired := pg_try_advisory_lock(lock_id);
      IF lock_acquired THEN
        EXECUTE 'SET LOCAL statement_timeout TO ''90s''';
        REFRESH MATERIALIZED VIEW CONCURRENTLY entity_stats;
      ELSE
        RAISE NOTICE '[entity_stats] Lock not available - skipping refresh.';
      END IF;
    EXCEPTION
      WHEN others THEN RAISE WARNING '[entity_stats] Refresh failed: %', SQLERRM;
      PERFORM pg_advisory_unlock(lock_id);
  END $$ LANGUAGE plpgsql;
`);

const down = db => db.raw(`
  DROP FUNCTION refresh_entity_stats;
  DROP MATERIALIZED VIEW entity_stats;
`);

module.exports = { up, down };
