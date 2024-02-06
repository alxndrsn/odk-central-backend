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
    db.raw(`create table "public_links" ("actorId" integer, "createdBy" integer not null, "formId" integer not null, "once" boolean, "createdAt" timestamptz)`);
    db.raw(`alter table "public_links" add constraint "public_links_pkey" primary key ("actorId")`);
    db.raw(`alter table "public_links" add constraint "public_links_actorid_foreign" foreign key ("actorId") references "actors" ("id")`);
    db.raw(`alter table "public_links" add constraint "public_links_formid_foreign" foreign key ("formId") references "forms" ("id")`);
    db.raw(`alter table "public_links" add constraint "public_links_createdby_foreign" foreign key ("createdBy") references "actors" ("id")`);
    db.raw(`insert into "roles" ("createdAt", "name", "system", "verbs") values (NOW(), $1, $2, $3)`, 'Public Link', 'pub-link', '["form.read", "submission.create"]');
    db.raw(`select "verbs" from "roles" where "system" = $1`, 'admin');
    db.raw(`update "roles" set "verbs" = $1 where "system" = $2`, '["backup.create", "backup.terminate", "config.read", "field_key.create", "field_key.delete", "field_key.list", "form.create", "form.delete", "form.list", "form.read", "form.update", "project.create", "project.delete", "project.read", "project.update", "session.end", "submission.create", "submission.read", "submission.list", "user.create", "user.list", "user.password.invalidate", "user.read", "user.update", "submission.update", "role.create", "role.update", "role.delete", "assignment.list", "assignment.create", "assignment.delete", "user.delete", "audit.read", "public_link.create", "public_link.list", "public_link.read", "public_link.update", "public_link.delete"]', 'admin');
    db.raw(`select "verbs" from "roles" where "system" = $1`, 'manager');
    db.raw(`update "roles" set "verbs" = $1 where "system" = $2`, '["project.read", "project.update", "project.delete", "form.create", "form.delete", "form.list", "form.read", "form.update", "submission.create", "submission.read", "submission.list", "submission.update", "field_key.create", "field_key.delete", "field_key.list", "assignment.list", "assignment.create", "assignment.delete", "public_link.create", "public_link.list", "public_link.read", "public_link.update", "public_link.delete"]', 'manager');
  },
};
