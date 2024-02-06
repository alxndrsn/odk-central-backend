// Copyright 2024 ODK Central Developers
// See the NOTICE file at the top-level directory of this distribution and at
// https://github.com/getodk/central-backend/blob/master/NOTICE.
// This file is part of ODK Central. It is subject to the license terms in
// the LICENSE file found in the top-level directory of this distribution and at
// https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
// including this file, may be copied, modified, propagated, or distributed
// except according to the terms contained in the LICENSE file.

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
