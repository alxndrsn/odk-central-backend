module.exports = {
  up: (db) => {
    db.raw(`alter table "form_defs" add column "xlsBlobId" integer`);
    db.raw(`alter table "form_defs" add constraint "form_defs_xlsblobid_foreign" foreign key ("xlsBlobId") references "blobs" ("id")`);
  },
};
