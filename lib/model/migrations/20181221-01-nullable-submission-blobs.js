module.exports = {
  up: (db) => {
    db.raw(`alter table "submission_attachments" alter column "blobId" drop default`);
    db.raw(`alter table "submission_attachments" alter column "blobId" drop not null`);
    db.raw(`alter table "submission_attachments" alter column "blobId" type integer using ("blobId"::integer)`);
  },
};
