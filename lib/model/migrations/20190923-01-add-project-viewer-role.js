module.exports = {
  up: (db) => {
    db.raw(`insert into "roles" ("name", "system", "verbs") values ($1, $2, $3)`, 'Project Viewer', 'viewer', '["project.read", "form.list", "form.read", "submission.read", "submission.list"]');
  },
};
