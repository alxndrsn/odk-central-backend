module.exports = {
  up: (db) => {
    db.raw(`select "verbs" from "roles" where "system" = $1`, 'manager');
    db.raw(`update "roles" set "verbs" = $1 where "system" = $2`, '["project.read", "project.update", "project.delete", "form.create", "form.delete", "form.list", "form.read", "form.update", "submission.create", "submission.read", "submission.list", "submission.update", "field_key.create", "field_key.delete", "field_key.list", "assignment.list", "assignment.create", "assignment.delete", "public_link.create", "public_link.list", "public_link.read", "public_link.update", "public_link.delete", "session.end"]', 'manager');
  },
};
