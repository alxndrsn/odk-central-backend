module.exports = {
  up: (db) => {
    db.raw(`insert into "actees" ("id", "species") values ($1, $2)`, 'assignment', 'species');
  },
};
