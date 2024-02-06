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
    await db.raw(`create table "client_audits" ("blobId" integer not null, "event" text, "node" text, "start" text, "end" text, "latitude" text, "longitude" text, "accuracy" text, "old-value" text, "new-value" text, "remainder" jsonb)`);
    await db.raw(`alter table "client_audits" add constraint "client_audits_blobid_foreign" foreign key ("blobId") references "blobs" ("id")`);
    await db.raw(`create index "client_audits_start_index" on "client_audits" ("start")`);
    await db.raw(`alter table "submission_attachments" add column "isClientAudit" boolean`);
  },
};
