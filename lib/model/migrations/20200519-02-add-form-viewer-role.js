module.exports = {
  up: (db) => {
    db.raw(`insert into "roles" ("name", "system", "verbs") values ($1, $2, $3)`, 'Form Viewer (system internal)', 'formview', '["form.read"]');
  },
};
