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
    db.raw(`alter table "form_attachments" add column "updatedAt" timestamptz`);
    db.raw(`
	    with logs as (
	      select details->>'formDefId' as "defId", details->>'name' as name, max("loggedAt") as at
	        from audits
	        where action = 'form.attachment.update'
	        group by details->>'formDefId', details->>'name')
	    update form_attachments
	      set "updatedAt" = logs.at
	      from logs
	      where
	        form_attachments."formDefId"::text = logs."defId" and
	        form_attachments.name = logs.name;`);
  },
};
