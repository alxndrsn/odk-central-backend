module.exports = {
  up: (db) => {
    db.raw(`ALTER TABLE users DROP COLUMN "mfaSecret"`);
  },
};
