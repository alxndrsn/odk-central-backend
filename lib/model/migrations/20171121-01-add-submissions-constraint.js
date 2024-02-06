module.exports = {
  up: (db) => {
    db.raw(`alter table "submissions" add constraint "submissions_formid_instanceid_unique" unique ("formId", "instanceId")`);
  },
};
