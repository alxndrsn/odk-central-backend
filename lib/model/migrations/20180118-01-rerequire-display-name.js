module.exports = {
  up: (db) => {
    db.raw(`update actors set "displayName"=(select email from users where users."actorId"=actors.id) where "displayName" is null and type='user';`);
    db.raw(`alter table "actors" alter column "displayName" drop default`);
    db.raw(`alter table "actors" alter column "displayName" drop not null`);
    db.raw(`alter table "actors" alter column "displayName" type varchar(64) using ("displayName"::varchar(64))`);
    db.raw(`alter table "actors" alter column "displayName" set not null`);
  },
};
