// Copyright 2024 ODK Central Developers
// See the NOTICE file at the top-level directory of this distribution and at
// https://github.com/getodk/central-backend/blob/master/NOTICE.
// This file is part of ODK Central. It is subject to the license terms in
// the LICENSE file found in the top-level directory of this distribution and at
// https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
// including this file, may be copied, modified, propagated, or distributed
// except according to the terms contained in the LICENSE file.

module.exports = {
  down: () => { throw new Error('down() not yet supported for this migration'); },
  up: async (db) => {
    db.raw(`create table "blobs" ("id" serial primary key, "sha" varchar(40) not null, "content" bytea not null, "contentType" text)`);
    db.raw(`create table "attachments" ("submissionId" integer not null, "blobId" integer not null, "name" text not null)`);
    db.raw(`alter table "blobs" add constraint "blobs_sha_unique" unique ("sha")`);
    db.raw(`alter table "attachments" add constraint "attachments_pkey" primary key ("submissionId", "name")`);
    db.raw(`create index "blobs_sha_index" on "blobs" ("sha")`);
    db.raw(`alter table "attachments" add constraint "attachments_submissionid_foreign" foreign key ("submissionId") references "submissions" ("id")`);
    db.raw(`alter table "attachments" add constraint "attachments_blobid_foreign" foreign key ("blobId") references "blobs" ("id")`);
    db.raw(`create index "attachments_submissionid_index" on "attachments" ("submissionId")`);
  },
};
