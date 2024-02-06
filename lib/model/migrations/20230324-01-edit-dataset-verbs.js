module.exports = {
  up: (db) => {
    db.raw(`
        UPDATE roles
        SET verbs = verbs || '["dataset.read", "entity.read"]'::jsonb
        WHERE system in ('admin', 'manager', 'viewer')
        `);
    db.raw(`
        UPDATE roles
        SET verbs = verbs || '["entity.create", "entity.update"]'::jsonb
        WHERE system in ('admin', 'manager')
        `);
  },
};
