module.exports = {
  up: (db) => {
    db.raw(`select "verbs" from "roles" where "system" = $1`, 'admin');
    db.raw(`update "roles" set "verbs" = $1 where "system" = $2`, '["config.read", "field_key.create", "field_key.delete", "field_key.list", "form.create", "form.delete", "form.list", "form.read", "form.update", "project.create", "project.delete", "project.read", "project.update", "session.end", "submission.create", "submission.read", "submission.list", "user.create", "user.list", "user.password.invalidate", "user.read", "user.update", "submission.update", "role.create", "role.update", "role.delete", "assignment.list", "assignment.create", "assignment.delete", "user.delete", "audit.read", "public_link.create", "public_link.list", "public_link.read", "public_link.update", "public_link.delete", "backup.run", "submission.update", "config.set", "analytics.read", "form.restore", "dataset.list", "entity.list"]', 'admin');
    db.raw(`select "verbs" from "roles" where "system" = $1`, 'manager');
    db.raw(`update "roles" set "verbs" = $1 where "system" = $2`, '["project.read", "project.update", "project.delete", "form.create", "form.delete", "form.list", "form.read", "form.update", "submission.create", "submission.read", "submission.list", "submission.update", "field_key.create", "field_key.delete", "field_key.list", "assignment.list", "assignment.create", "assignment.delete", "public_link.create", "public_link.list", "public_link.read", "public_link.update", "public_link.delete", "session.end", "submission.update", "form.restore", "dataset.list", "entity.list"]', 'manager');
    db.raw(`select "verbs" from "roles" where "system" = $1`, 'viewer');
    db.raw(`update "roles" set "verbs" = $1 where "system" = $2`, '["project.read", "form.list", "form.read", "submission.read", "submission.list", "dataset.list", "entity.list"]', 'viewer');
  },
};
