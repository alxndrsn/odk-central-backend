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
    db.raw(`update "grants" set "acteeId" = $1, "verb" = $2 where "acteeId" = $3 and "verb" = $4`, 'project', 'submission.create', 'form', 'createSubmission');
    db.raw(`update "grants" set "acteeId" = $1, "verb" = $2 where "acteeId" = $3 and "verb" = $4`, 'project', 'form.list', 'form', 'list');
    db.raw(`update "grants" set "acteeId" = $1, "verb" = $2 where "acteeId" = $3 and "verb" = $4`, 'project', 'form.read', 'form', 'read');
  },
};
