module.exports = {
  up: (db) => {
    db.raw(`alter table "forms" add column "acteeId" varchar(36) not null`);
    db.raw(`alter table "forms" add constraint "forms_acteeid_foreign" foreign key ("acteeId") references "actees" ("id")`);
  },
};
