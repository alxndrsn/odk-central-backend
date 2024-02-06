module.exports = {
  up: (db) => {
    db.raw(`alter table "form_defs" drop constraint "form_defs_formid_foreign"`);
    db.raw(`alter table "form_defs" add constraint "form_defs_formid_foreign" foreign key ("formId") references "forms" ("id") on delete cascade`);
    db.raw(`alter table "form_attachments" drop constraint "form_attachments_formid_foreign"`);
    db.raw(`alter table "form_attachments" add constraint "form_attachments_formid_foreign" foreign key ("formId") references "forms" ("id") on delete cascade`);
    db.raw(`alter table "form_attachments" drop constraint "form_attachments_formdefid_foreign"`);
    db.raw(`alter table "form_attachments" add constraint "form_attachments_formdefid_foreign" foreign key ("formDefId") references "form_defs" ("id") on delete cascade`);
    db.raw(`alter table "form_fields" drop constraint "form_fields_formid_foreign"`);
    db.raw(`alter table "form_fields" add constraint "form_fields_formid_foreign" foreign key ("formId") references "forms" ("id") on delete cascade`);
    db.raw(`alter table "form_fields" drop constraint "form_fields_formdefid_foreign"`);
    db.raw(`alter table "form_fields" add constraint "form_fields_formdefid_foreign" foreign key ("formDefId") references "form_defs" ("id") on delete cascade`);
    db.raw(`alter table "public_links" drop constraint "public_links_formid_foreign"`);
    db.raw(`alter table "public_links" add constraint "public_links_formid_foreign" foreign key ("formId") references "forms" ("id") on delete cascade`);
    db.raw(`alter table "submissions" drop constraint "submissions_formid_foreign"`);
    db.raw(`alter table "submissions" add constraint "submissions_formid_foreign" foreign key ("formId") references "forms" ("id") on delete cascade`);
    db.raw(`alter table "submission_defs" drop constraint "submission_defs_formdefid_foreign"`);
    db.raw(`alter table "submission_defs" add constraint "submission_defs_formdefid_foreign" foreign key ("formDefId") references "form_defs" ("id") on delete cascade`);
    db.raw(`alter table "comments" drop constraint "comments_submissionid_foreign"`);
    db.raw(`alter table "comments" add constraint "comments_submissionid_foreign" foreign key ("submissionId") references "submissions" ("id") on delete cascade`);
    db.raw(`alter table "form_field_values" drop constraint "form_field_values_formid_foreign"`);
    db.raw(`alter table "form_field_values" add constraint "form_field_values_formid_foreign" foreign key ("formId") references "forms" ("id") on delete cascade`);
    db.raw(`alter table "form_field_values" drop constraint "form_field_values_submissiondefid_foreign"`);
    db.raw(`alter table "form_field_values" add constraint "form_field_values_submissiondefid_foreign" foreign key ("submissionDefId") references "submission_defs" ("id") on delete cascade`);
  },
};
