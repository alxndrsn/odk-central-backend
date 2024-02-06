module.exports = {
  up: (db) => {
    db.raw(`create table "form_fields" ("formId" integer not null, "formDefId" integer not null, "path" text not null, "name" text not null, "type" varchar(32) not null, "binary" boolean, "order" integer not null)`);
    db.raw(`alter table "form_fields" add constraint "form_fields_pkey" primary key ("formDefId", "path")`);
    db.raw(`create index "form_fields_formdefid_order_index" on "form_fields" ("formDefId", "order")`);
    db.raw(`create index "form_fields_formdefid_binary_index" on "form_fields" ("formDefId", "binary")`);
    db.raw(`create index "form_fields_formid_path_type_index" on "form_fields" ("formId", "path", "type")`);
    db.raw(`alter table "form_fields" add constraint "form_fields_formid_foreign" foreign key ("formId") references "forms" ("id")`);
    db.raw(`alter table "form_fields" add constraint "form_fields_formdefid_foreign" foreign key ("formDefId") references "form_defs" ("id")`);
  },
};
