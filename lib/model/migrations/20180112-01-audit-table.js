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
    db.raw(`create table "audits" ("actorId" integer, "action" varchar(16) not null, "acteeId" varchar(36), "details" json, "loggedAt" timestamptz)`);
    db.raw(`alter table "audits" add constraint "audits_actorid_foreign" foreign key ("actorId") references "actors" ("id")`);
    db.raw(`alter table "audits" add constraint "audits_acteeid_foreign" foreign key ("acteeId") references "actees" ("id")`);
    db.raw(`create index "audits_actorid_loggedat_index" on "audits" ("actorId", "loggedAt")`);
    db.raw(`create index "audits_actorid_action_loggedat_index" on "audits" ("actorId", "action", "loggedAt")`);
    db.raw(`create index "audits_action_acteeid_loggedat_index" on "audits" ("action", "acteeId", "loggedAt")`);
    db.raw(`create index "audits_acteeid_loggedat_index" on "audits" ("acteeId", "loggedAt")`);
  },
};
