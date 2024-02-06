module.exports = {
  up: (db) => {
    db.raw(`insert into "roles" ("name", "system", "verbs") values ($1, $2, $3)`, 'Project Manager', 'manager', '["project.read", "project.update", "project.delete", "form.create", "form.delete", "form.list", "form.read", "form.update", "submission.create", "submission.read", "submission.list", "submission.update", "field_key.create", "field_key.delete", "field_key.list", "assignment.list", "assignment.create", "assignment.delete"]');
  },
};
