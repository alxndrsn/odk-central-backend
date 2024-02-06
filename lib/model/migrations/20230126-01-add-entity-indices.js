module.exports = {
  up: (db) => {
    db.raw(`create index "entities_datasetid_createdat_id_index" on "entities" ("datasetId", "createdAt", "id")`);
    db.raw(`create index "entity_defs_entityid_current_index" on "entity_defs" ("entityId", "current")`);
    db.raw(`create index "entity_defs_submissiondefid_index" on "entity_defs" ("submissionDefId")`);
  },
};
