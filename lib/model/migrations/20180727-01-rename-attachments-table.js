module.exports = {
  up: (db) => {
    db.raw(`alter table attachments rename to submission_attachments;`);
  },
};
