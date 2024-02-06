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
    db.raw(`create table "comments" ("id" serial primary key, "submissionId" integer not null, "actorId" integer not null, "body" text not null, "createdAt" timestamptz)`);
    db.raw(`alter table "comments" add constraint "comments_submissionid_foreign" foreign key ("submissionId") references "submissions" ("id")`);
    db.raw(`alter table "comments" add constraint "comments_actorid_foreign" foreign key ("actorId") references "actors" ("id")`);
    db.raw(`create index "comments_submissionid_index" on "comments" ("submissionId")`);
  },
};
