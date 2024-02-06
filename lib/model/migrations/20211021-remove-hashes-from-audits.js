module.exports = {
  up: (db) => {
    db.raw(`
        UPDATE audits SET details=(details #- '{data,password}')
          WHERE action='user.create'
            AND details->'data'->'password' IS NOT NULL`);
  },
};
