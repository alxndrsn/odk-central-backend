module.exports = {
  up: (db) => {
    db.raw(`ALTER TABLE dataset_form_defs ADD COLUMN actions jsonb`);
    db.raw(`UPDATE dataset_form_defs SET actions = '["create"]'`);
    db.raw(`ALTER TABLE dataset_form_defs ALTER COLUMN actions SET NOT NULL`);
  },
};
