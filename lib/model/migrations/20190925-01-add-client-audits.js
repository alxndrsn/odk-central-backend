module.exports = {
  up: (db) => {
    db.raw(`create table "client_audits" ("blobId" integer not null, "event" text, "node" text, "start" text, "end" text, "latitude" text, "longitude" text, "accuracy" text, "old-value" text, "new-value" text, "remainder" jsonb)`);
    db.raw(`alter table "client_audits" add constraint "client_audits_blobid_foreign" foreign key ("blobId") references "blobs" ("id")`);
    db.raw(`create index "client_audits_start_index" on "client_audits" ("start")`);
    db.raw(`alter table "submission_attachments" add column "isClientAudit" boolean`);
  },
};
