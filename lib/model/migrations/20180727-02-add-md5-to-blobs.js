module.exports = {
  up: (db) => {
    db.raw(`alter table "blobs" add column "md5" varchar(32)`);
    db.raw(`select * from "blobs"`);
    db.raw(`alter table "blobs" alter column "md5" drop default`);
    db.raw(`alter table "blobs" alter column "md5" drop not null`);
    db.raw(`alter table "blobs" alter column "md5" type varchar(32) using ("md5"::varchar(32))`);
    db.raw(`alter table "blobs" alter column "md5" set not null`);
  },
};
