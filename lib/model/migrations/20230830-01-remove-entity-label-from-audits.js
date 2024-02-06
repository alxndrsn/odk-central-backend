module.exports = {
  up: (db) => {
    db.raw(`
        update audits set details=(details #- '{entity,label}')
          where action='entity.create'`);
  },
};
