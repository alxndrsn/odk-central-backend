// Copyright 2025 ODK Central Developers
// See the NOTICE file at the top-level directory of this distribution and at
// https://github.com/getodk/central-backend/blob/master/NOTICE.
// This file is part of ODK Central. It is subject to the license terms in
// the LICENSE file found in the top-level directory of this distribution and at
// https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
// including this file, may be copied, modified, propagated, or distributed
// except according to the terms contained in the LICENSE file.

const up = db => db.raw(`
  DROP VIEW IF EXISTS entity_stats; -- FIXME remove this if actually looking to merge to master
  CREATE VIEW entity_stats AS
    SELECT "datasetId"
         , COUNT(*) AS "entities"
         , MAX("createdAt") AS "lastEntity"
         , COUNT(*) FILTER (WHERE conflict IS NOT NULL) AS "conflicts"
      FROM (
        -- Subquery tricks the query planner into avoiding a Seq Scan
        SELECT "datasetId"
             , "createdAt"
             , conflict
          FROM entities
          WHERE "deletedAt" IS NULL
      ) AS _
      GROUP BY "datasetId";
`);

const down = db => db.raw(`
  DROP VIEW entity_stats
`);

module.exports = { up, down };
