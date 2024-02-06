module.exports = {
  up: (db) => {
    db.raw(`insert into "roles" ("createdAt", "name", "system") values ($1, $2, $3), ($4, $5, $6) returning "id"`, '2024-02-06 12:15:44.749+00', 'Password Reset Token', 'pwreset', '2024-02-06 12:15:44.749+00', 'Backups Verification Token', 'initbkup');
    db.raw(`insert into "grants" ("roleId", "verb") values ($1, $2)`, '3', 'user.password.reset');
    db.raw(`insert into "grants" ("roleId", "verb") values ($1, $2)`, '4', 'backup.verify');
  },
};
