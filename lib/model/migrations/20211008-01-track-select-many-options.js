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
    db.raw(`alter table "form_fields" add column "selectMultiple" boolean`);
    db.raw(`create table "form_field_values" ("formId" integer not null, "submissionDefId" integer not null, "path" text not null, "value" text)`);
    db.raw(`create index "form_field_values_formid_index" on "form_field_values" ("formId")`);
    db.raw(`create index "form_field_values_submissiondefid_index" on "form_field_values" ("submissionDefId")`);
    db.raw(`create index "form_field_values_formid_submissiondefid_path_index" on "form_field_values" ("formId", "submissionDefId", "path")`);
    db.raw(`alter table "form_field_values" add constraint "form_field_values_formid_foreign" foreign key ("formId") references "forms" ("id")`);
    db.raw(`alter table "form_field_values" add constraint "form_field_values_submissiondefid_foreign" foreign key ("submissionDefId") references "submission_defs" ("id")`);
    db.raw(`select "formId", "path" from "form_fields" where "selectMultiple" = $1 group by "formId", "path"`, 't');
    db.raw(`select "formId", "submission_defs"."id", "xml" from "submission_defs" inner join (select "id", "formId" from "form_defs" where 1 = $1) as "fds" on "fds"."id" = "formDefId"`, '0');
  },
};
