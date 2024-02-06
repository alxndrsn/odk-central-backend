module.exports = {
  up: (db) => {
    db.raw(`update roles set verbs = verbs - 'form.list' where system = 'app_user';`);
    db.raw(`update roles set system = 'app-user' where system = 'app_user';`);
  },
};
