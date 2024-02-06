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
