module.exports = {
  up: (db) => {
    db.raw(`insert into "roles" ("name", "system", "verbs") values ($1, $2, $3)`, 'Data Collector', 'formfill', '["project.read", "form.list", "form.read", "submission.create"]');
  },
};
