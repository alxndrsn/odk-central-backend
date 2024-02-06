// Copyright 2024 ODK Central Developers
// See the NOTICE file at the top-level directory of this distribution and at
// https://github.com/getodk/central-backend/blob/master/NOTICE.
// This file is part of ODK Central. It is subject to the license terms in
// the LICENSE file found in the top-level directory of this distribution and at
// https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
// including this file, may be copied, modified, propagated, or distributed
// except according to the terms contained in the LICENSE file.

module.exports = {
  up: async (db) => {
    db.raw(`create index "entities_datasetid_createdat_id_index" on "entities" ("datasetId", "createdAt", "id")`);
    db.raw(`create index "entity_defs_entityid_current_index" on "entity_defs" ("entityId", "current")`);
    db.raw(`create index "entity_defs_submissiondefid_index" on "entity_defs" ("submissionDefId")`);
  },
};
