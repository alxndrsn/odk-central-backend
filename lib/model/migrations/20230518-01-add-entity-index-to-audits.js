module.exports = {
  up: (db) => {
    db.raw(`CREATE INDEX audits_details_entity_index ON audits USING HASH (((details ->> 'entityId')::INTEGER))`);
  },
};
