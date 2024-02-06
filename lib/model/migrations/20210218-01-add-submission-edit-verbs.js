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
    db.raw(`select "verbs" from "roles" where "system" = $1`, 'admin');
    db.raw(`update "roles" set "verbs" = $1 where "system" = $2`, '["backup.create", "backup.terminate", "config.read", "field_key.create", "field_key.delete", "field_key.list", "form.create", "form.delete", "form.list", "form.read", "form.update", "project.create", "project.delete", "project.read", "project.update", "session.end", "submission.create", "submission.read", "submission.list", "user.create", "user.list", "user.password.invalidate", "user.read", "user.update", "submission.update", "role.create", "role.update", "role.delete", "assignment.list", "assignment.create", "assignment.delete", "user.delete", "audit.read", "public_link.create", "public_link.list", "public_link.read", "public_link.update", "public_link.delete", "backup.run", "submission.update"]', 'admin');
  },
};
