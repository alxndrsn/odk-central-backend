module.exports = {
  up: (db) => {
    db.raw(`CREATE TYPE "conflictType" AS ENUM ('soft', 'hard')`);
    db.raw(`ALTER TABLE entities ADD COLUMN conflict "conflictType" NULL`);
    db.raw(`ALTER TABLE entity_defs 
            ADD COLUMN "dataReceived" JSONB NOT NULL DEFAULT '{}'::jsonb,
        
            -- null means, it's a first version
            ADD COLUMN "baseVersion" INT4,  
        
            -- array of conflicting properties
            ADD COLUMN "conflictingProperties" JSONB NULL 
        
            -- Not adding explicit 'conflict' column: version created conflict if "baseVersion" < "version" - 1
          `);
    db.raw(`UPDATE entity_defs SET "dataReceived" = data || jsonb_build_object('label', "label"), "baseVersion" = CASE WHEN version > 1 THEN version - 1 ELSE NULL END`);
  },
};
