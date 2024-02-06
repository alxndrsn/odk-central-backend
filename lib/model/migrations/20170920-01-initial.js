module.exports = {
  up: (db) => {
    db.raw(`SELECT 'MIGRATION::20170920-01-initial.js'`);
    db.raw(`create table "forms" ("id" serial primary key, "xmlFormId" varchar(64) not null, "xml" text not null, "createdAt" timestamptz, "updatedAt" timestamptz, "deletedAt" timestamptz)`);
    db.raw(`create index "forms_xmlformid_index" on "forms" ("xmlFormId")`);
    db.raw(`alter table "forms" add constraint "forms_xmlformid_unique" unique ("xmlFormId")`);
    db.raw(`create table "submissions" ("id" serial primary key, "formId" integer not null, "instanceId" varchar(64) not null, "xml" text not null, "createdAt" timestamptz, "updatedAt" timestamptz, "deletedAt" timestamptz)`);
    db.raw(`create index "submissions_formid_index" on "submissions" ("formId")`);
    db.raw(`alter table "submissions" add constraint "submissions_formid_foreign" foreign key ("formId") references "forms" ("id")`);
    db.raw(`create index "submissions_formid_instanceid_index" on "submissions" ("formId", "instanceId")`);
  },
};
