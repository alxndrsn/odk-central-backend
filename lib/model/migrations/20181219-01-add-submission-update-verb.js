module.exports = {
  up: (db) => {
    db.raw(`select "id" from "roles" where "system" = $1`, 'admin');
    db.raw(`insert into "grants" ("roleId", "verb") values ($1, $2)`, '1', 'submission.update');
  },
};
