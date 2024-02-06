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
  up: (db) => {
    db.raw(`create table "form_attachments" ("formId" integer not null, "blobId" integer, "name" text not null, "type" text, "acteeId" varchar(36) not null)`);
    db.raw(`alter table "form_attachments" add constraint "form_attachments_pkey" primary key ("formId", "name")`);
    db.raw(`alter table "form_attachments" add constraint "form_attachments_formid_foreign" foreign key ("formId") references "forms" ("id")`);
    db.raw(`alter table "form_attachments" add constraint "form_attachments_blobid_foreign" foreign key ("blobId") references "blobs" ("id")`);
    db.raw(`alter table "form_attachments" add constraint "form_attachments_acteeid_foreign" foreign key ("acteeId") references "actees" ("id")`);
    db.raw(`create index "form_attachments_formid_index" on "form_attachments" ("formId")`);
    db.raw(`select "id", "xml", "xmlFormId" from "forms"`);
  },
};
