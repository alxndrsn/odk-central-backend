module.exports = {
  up: (db) => {
    db.raw(`ALTER TABLE entity_defs ADD COLUMN version INT4 NOT NULL DEFAULT 1`);
    db.raw(`
          UPDATE entity_defs SET "version" = vt.rownumber
          FROM (
            SELECT ROW_NUMBER() OVER(PARTITION BY "entityId" ORDER BY id ) rownumber, id FROM entity_defs
          )
          vt WHERE vt.id = entity_defs.id
        `);
  },
};
