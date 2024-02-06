module.exports = {
  up: (db) => {
    db.raw(`alter table audits add column id serial primary key`);
  },
};
