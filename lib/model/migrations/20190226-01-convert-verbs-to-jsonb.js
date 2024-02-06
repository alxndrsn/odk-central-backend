module.exports = {
  up: (db) => {
    db.raw(`select * from "grants"`);
    db.raw(`alter table "roles" add column "verbs" jsonb`);
    db.raw(`update "roles" set "verbs" = $1 where "id" = $2`, '["backup.create", "backup.terminate", "config.read", "field_key.create", "field_key.delete", "field_key.list", "form.create", "form.delete", "form.list", "form.read", "form.update", "project.create", "project.delete", "project.read", "project.update", "session.end", "submission.create", "submission.read", "submission.list", "user.create", "user.list", "user.password.invalidate", "user.read", "user.update", "submission.update", "role.create", "role.update", "role.delete"]', '1');
    db.raw(`update "roles" set "verbs" = $1 where "id" = $2`, '["form.list", "form.read", "submission.create"]', '2');
    db.raw(`update "roles" set "verbs" = $1 where "id" = $2`, '["user.password.reset"]', '3');
    db.raw(`update "roles" set "verbs" = $1 where "id" = $2`, '["backup.verify"]', '4');
    db.raw(`drop table "grants"`);
    db.raw(`create index roles_verbs_gin_index on roles using gin (verbs jsonb_path_ops)`);
  },
};
