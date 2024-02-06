module.exports = {
  up: (db) => {
    db.raw(`
        ALTER TABLE entity_defs
        ADD COLUMN "creatorId" integer,
        ADD COLUMN "userAgent" varchar(255)
        `);
    db.raw(`
        UPDATE entity_defs
        SET "creatorId" = entities."creatorId"
        FROM entities
        WHERE entity_defs."entityId" = entities.id;
          `);
    db.raw(`
        UPDATE entity_defs
        SET "userAgent" = submission_defs."userAgent"
        FROM submission_defs
        WHERE entity_defs."submissionDefId" = submission_defs.id;
          `);
    db.raw(`
        ALTER TABLE entity_defs
        ALTER COLUMN "creatorId" SET NOT NULL
        `);
  },
};
