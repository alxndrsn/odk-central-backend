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
    db.raw(`alter table "audits" add column "claimed" timestamptz, add column "processed" timestamptz, add column "lastFailure" timestamptz, add column "failures" integer default '0'`);
    db.raw(`create index "audits_claimed_processed_index" on "audits" ("claimed", "processed")`);
    db.raw(`update "audits" set "processed" = NOW()`);
  },
};
