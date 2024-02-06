module.exports = {
  up: (db) => {
    db.raw(`alter table "submissions" drop constraint "submissions_formid_instanceid_unique"`);
    db.raw(`alter table "submissions" add constraint "submissions_formid_instanceid_draft_unique" unique ("formId", "instanceId", "draft")`);
  },
};
