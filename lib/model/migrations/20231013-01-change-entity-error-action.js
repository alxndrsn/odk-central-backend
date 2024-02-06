module.exports = {
  up: (db) => {
    db.raw(`UPDATE audits SET "action" = 'entity.error' WHERE "action" = 'entity.create.error'`);
  },
};
