module.exports = {
  up: (db) => {
    db.raw(`select "acteeId" from "forms" where "deletedAt" is null and "currentDefId" is not null`);
    db.raw(``);
  },
};
