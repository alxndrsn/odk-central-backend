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
    db.raw(`alter table "submission_defs" add column "current" boolean`);
    db.raw(`create index "submission_defs_current_index" on "submission_defs" ("current")`);
    db.raw(`create index "submission_defs_submissionid_current_index" on "submission_defs" ("submissionId", "current")`);
    db.raw(`
	    update submission_defs
	      set current=true
	      from (select max(id) as id from submission_defs group by "submissionId")
	        as currents
	      where submission_defs.id = currents.id`);
  },
};