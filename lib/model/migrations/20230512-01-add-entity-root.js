module.exports = {
  up: (db) => {
    db.raw(`ALTER TABLE entity_defs ADD COLUMN "root" BOOLEAN NOT NULL DEFAULT FALSE`);
    db.raw(`UPDATE entity_defs SET root = TRUE
          WHERE id IN (SELECT MIN(id) FROM entity_defs GROUP BY "entityId")`);
  },
};
