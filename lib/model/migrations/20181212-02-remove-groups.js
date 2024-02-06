module.exports = {
  up: (db) => {
    db.raw(`drop table "memberships"`);
    db.raw(`delete from "actors" where "type" = $1`, 'system');
    db.raw(`alter table "actors" drop column "systemId"`);
  },
};
