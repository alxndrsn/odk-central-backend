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
    db.raw(`create table "keys" ("id" serial primary key, "public" text not null, "private" jsonb, "managed" boolean, "hint" text, "createdAt" timestamptz)`);
    db.raw(`alter table "keys" add constraint "keys_public_unique" unique ("public")`);
    db.raw(`create index "keys_public_index" on "keys" ("public")`);
    db.raw(`alter table "projects" add column "keyId" integer`);
    db.raw(`alter table "projects" add constraint "projects_keyid_foreign" foreign key ("keyId") references "keys" ("id")`);
    db.raw(`alter table "form_defs" add column "keyId" integer`);
    db.raw(`alter table "form_defs" add constraint "form_defs_keyid_foreign" foreign key ("keyId") references "keys" ("id")`);
    db.raw(`alter table "submission_defs" add column "encDataAttachmentName" varchar(255), add column "localKey" text, add column "signature" text`);
    db.raw(`alter table "submission_attachments" add column "index" integer`);
  },
};