module.exports = {
  up: (db) => {
    db.raw(`alter table config alter value type jsonb using value::jsonb`);
  },
};
