module.exports = {
  up: (db) => {
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
