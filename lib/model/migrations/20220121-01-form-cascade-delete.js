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
    await db.raw(`alter table "form_defs" drop constraint "form_defs_formid_foreign"`);
    await db.raw(`alter table "form_defs" add constraint "form_defs_formid_foreign" foreign key ("formId") references "forms" ("id") on delete cascade`);
    await db.raw(`alter table "form_attachments" drop constraint "form_attachments_formid_foreign"`);
    await db.raw(`alter table "form_attachments" add constraint "form_attachments_formid_foreign" foreign key ("formId") references "forms" ("id") on delete cascade`);
    await db.raw(`alter table "form_attachments" drop constraint "form_attachments_formdefid_foreign"`);
    await db.raw(`alter table "form_attachments" add constraint "form_attachments_formdefid_foreign" foreign key ("formDefId") references "form_defs" ("id") on delete cascade`);
    await db.raw(`alter table "form_fields" drop constraint "form_fields_formid_foreign"`);
    await db.raw(`alter table "form_fields" add constraint "form_fields_formid_foreign" foreign key ("formId") references "forms" ("id") on delete cascade`);
    await db.raw(`alter table "form_fields" drop constraint "form_fields_formdefid_foreign"`);
    await db.raw(`alter table "form_fields" add constraint "form_fields_formdefid_foreign" foreign key ("formDefId") references "form_defs" ("id") on delete cascade`);
    await db.raw(`alter table "public_links" drop constraint "public_links_formid_foreign"`);
    await db.raw(`alter table "public_links" add constraint "public_links_formid_foreign" foreign key ("formId") references "forms" ("id") on delete cascade`);
    await db.raw(`alter table "submissions" drop constraint "submissions_formid_foreign"`);
    await db.raw(`alter table "submissions" add constraint "submissions_formid_foreign" foreign key ("formId") references "forms" ("id") on delete cascade`);
    await db.raw(`alter table "submission_defs" drop constraint "submission_defs_formdefid_foreign"`);
    await db.raw(`alter table "submission_defs" add constraint "submission_defs_formdefid_foreign" foreign key ("formDefId") references "form_defs" ("id") on delete cascade`);
    await db.raw(`alter table "comments" drop constraint "comments_submissionid_foreign"`);
    await db.raw(`alter table "comments" add constraint "comments_submissionid_foreign" foreign key ("submissionId") references "submissions" ("id") on delete cascade`);
    await db.raw(`alter table "form_field_values" drop constraint "form_field_values_formid_foreign"`);
    await db.raw(`alter table "form_field_values" add constraint "form_field_values_formid_foreign" foreign key ("formId") references "forms" ("id") on delete cascade`);
    await db.raw(`alter table "form_field_values" drop constraint "form_field_values_submissiondefid_foreign"`);
    await db.raw(`alter table "form_field_values" add constraint "form_field_values_submissiondefid_foreign" foreign key ("submissionDefId") references "submission_defs" ("id") on delete cascade`);
  },
};
