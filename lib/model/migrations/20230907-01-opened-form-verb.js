module.exports = {
  up: (db) => {
    db.raw(`
        UPDATE roles SET verbs = REPLACE(verbs ::TEXT, 'form', 'open_form')::JSONB
        WHERE system IN ('app-user', 'formview', 'formfill', 'pub-link')`);
  },
};
