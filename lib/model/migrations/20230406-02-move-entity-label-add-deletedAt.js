module.exports = {
  up: (db) => {
    db.raw(`
          ALTER TABLE entity_defs
          ADD COLUMN "label" text
          `);
    db.raw(`
          UPDATE entity_defs
          set "label" = entities."label"
          FROM entities
          WHERE entity_defs."entityId" = entities.id;
          `);
    db.raw(`
          ALTER TABLE entity_defs
          ALTER COLUMN "label" SET NOT NULL
          `);
    db.raw(`
          ALTER TABLE entities
          DROP COLUMN "label",
          ADD COLUMN "deletedAt" timestamp
          `);
  },
};
