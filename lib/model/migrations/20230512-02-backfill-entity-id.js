module.exports = {
  up: (db) => {
    db.raw(`
          UPDATE audits
            SET details = details || jsonb_build_object('entityId', entities."id") || jsonb_build_object('entityDefId', entity_defs."id")
            FROM entities
            JOIN datasets ON entities."datasetId" = datasets.id
            JOIN entity_defs ON entities.id = entity_defs."entityId" AND root
            WHERE
              audits.action = 'entity.create' AND
              audits."acteeId" = datasets."acteeId" AND
              entities.uuid::text = audits.details->'entity'->>'uuid'`);
  },
};
