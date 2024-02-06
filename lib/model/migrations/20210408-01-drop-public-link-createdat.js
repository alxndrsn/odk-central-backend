module.exports = {
  up: (db) => {
    db.raw(`alter table "public_links" drop column "createdAt"`);
  },
};
