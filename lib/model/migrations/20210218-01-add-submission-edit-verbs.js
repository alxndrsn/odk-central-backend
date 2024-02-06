module.exports = {
  up: (db) => {
    db.raw(`select "verbs" from "roles" where "system" = $1`, 'admin');
    db.raw(`update "roles" set "verbs" = $1 where "system" = $2`, '["backup.create", "backup.terminate", "config.read", "field_key.create", "field_key.delete", "field_key.list", "form.create", "form.delete", "form.list", "form.read", "form.update", "project.create", "project.delete", "project.read", "project.update", "session.end", "submission.create", "submission.read", "submission.list", "user.create", "user.list", "user.password.invalidate", "user.read", "user.update", "submission.update", "role.create", "role.update", "role.delete", "assignment.list", "assignment.create", "assignment.delete", "user.delete", "audit.read", "public_link.create", "public_link.list", "public_link.read", "public_link.update", "public_link.delete", "backup.run", "submission.update"]', 'admin');
  },
};
