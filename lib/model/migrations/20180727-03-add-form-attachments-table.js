module.exports = {
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
