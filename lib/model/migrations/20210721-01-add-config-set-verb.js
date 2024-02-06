module.exports = {
  up: (db) => {
    db.raw(`
        update roles
        set verbs = (verbs - 'backup.create' - 'backup.terminate') || '["config.set"]'::jsonb
        where verbs ? 'backup.create' or verbs ? 'backup.terminate'`);
  },
};
