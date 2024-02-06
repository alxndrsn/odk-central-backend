module.exports = {
  up: (db) => {
    db.raw(`ALTER TABLE ds_property_fields DROP COLUMN "schemaId"`);
  },
};
