module.exports = {
  up: (db) => {
    db.raw(`ALTER TABLE datasets ADD COLUMN "approvalRequired" BOOLEAN NOT NULL DEFAULT FALSE;`);
    db.raw(`UPDATE datasets SET "approvalRequired" = TRUE;`);
    db.raw(`UPDATE roles SET verbs = verbs || '["dataset.update"]'::jsonb WHERE system in ('admin', 'manager')`);
  },
};
