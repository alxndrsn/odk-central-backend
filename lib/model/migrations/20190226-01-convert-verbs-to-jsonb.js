// Copyright 2024 ODK Central Developers
// See the NOTICE file at the top-level directory of this distribution and at
// https://github.com/getodk/central-backend/blob/master/NOTICE.
// This file is part of ODK Central. It is subject to the license terms in
// the LICENSE file found in the top-level directory of this distribution and at
// https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
// including this file, may be copied, modified, propagated, or distributed
// except according to the terms contained in the LICENSE file.

module.exports = {
  up: (db) => {
    db.raw(`select * from "grants"`);
    db.raw(`alter table "roles" add column "verbs" jsonb`);
    db.raw(`drop table "grants"`);
    db.raw(`create index roles_verbs_gin_index on roles using gin (verbs jsonb_path_ops)`);
  },
};
