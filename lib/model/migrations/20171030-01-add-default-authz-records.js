module.exports = {
  up: (db) => {
    db.raw(`alter table "grants" add column "system" boolean`);
    db.raw(`alter table "actors" add column "systemId" varchar(8)`);
    db.raw(`alter table "actors" add constraint "actors_systemid_unique" unique ("systemId")`);
    db.raw(`insert into "actees" ("id", "species") values ($1, $2), ($3, $4), ($5, $6), ($7, $8), ($9, $10), ($11, $12)`, '*', 'species', 'actor', 'species', 'group', 'species', 'user', 'species', 'form', 'species', 'submission', 'species');
    db.raw(`insert into "actees" ("id", "species") values ($1, $2) returning "id"`, '2e059307-5512-4dd9-aa95-912cdc0ff633', 'system');
    db.raw(`insert into "actees" ("id", "species") values ($1, $2) returning "id"`, '92607481-69c9-4b5a-aefb-9739e3b86715', 'system');
    db.raw(`insert into "actees" ("id", "species") values ($1, $2) returning "id"`, 'f2c50d64-7ed1-4983-9067-1e36b212495a', 'system');
    db.raw(`insert into "actors" ("acteeId", "displayName", "systemId", "type") values ($1, $2, $3, $4) returning "id"`, '2e059307-5512-4dd9-aa95-912cdc0ff633', 'Administrators', 'admins', 'system');
    db.raw(`insert into "actors" ("acteeId", "displayName", "systemId", "type") values ($1, $2, $3, $4) returning "id"`, '92607481-69c9-4b5a-aefb-9739e3b86715', 'Anybody', '*', 'system');
    db.raw(`insert into "actors" ("acteeId", "displayName", "systemId", "type") values ($1, $2, $3, $4) returning "id"`, 'f2c50d64-7ed1-4983-9067-1e36b212495a', 'All Registered Users', 'authed', 'system');
    db.raw(`insert into "grants" ("acteeId", "actorId", "system", "verb") values ($1, $2, $3, $4)`, '*', '1', 't', '*');
  },
};
