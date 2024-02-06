module.exports = {
  up: (db) => {
    db.raw(`update "actees" set "species" = $1 where "id" in (select "acteeId" from "actors" where "type" is null)`, 'user');
    db.raw(`update "actors" set "type" = $1 where "type" is null`, 'user');
  },
};
