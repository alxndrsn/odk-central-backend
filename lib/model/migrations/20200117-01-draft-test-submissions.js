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
    db.raw(`alter table "submissions" add column "draft" boolean`);
    db.raw(`create index "submissions_draft_index" on "submissions" ("draft")`);
    db.raw(`update submissions set draft = false`);
    db.raw(`alter table "submissions" alter column "draft" drop default`);
    db.raw(`alter table "submissions" alter column "draft" drop not null`);
    db.raw(`alter table "submissions" alter column "draft" type boolean using ("draft"::boolean)`);
    db.raw(`alter table "submissions" alter column "draft" set not null`);
  },
};
