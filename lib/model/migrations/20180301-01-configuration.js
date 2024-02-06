module.exports = {
  up: (db) => {
    db.raw(`create table "config" ("key" varchar(40), "value" text)`);
    db.raw(`alter table "config" add constraint "config_pkey" primary key ("key")`);
    db.raw(`insert into "actees" ("id", "species") values ($1, $2)`, 'config', 'species');
  },
};
