module.exports = {
  up: (db) => {
    db.raw(`select "id" from "roles" where "system" = $1`, 'admin');
    db.raw(`insert into "grants" ("roleId", "verb") values ($1, $2), ($3, $4), ($5, $6)`, '1', 'role.create', '1', 'role.update', '1', 'role.delete');
  },
};
