// Copyright 2024 ODK Central Developers
// See the NOTICE file at the top-level directory of this distribution and at
// https://github.com/getodk/central-backend/blob/master/NOTICE.
// This file is part of ODK Central. It is subject to the license terms in
// the LICENSE file found in the top-level directory of this distribution and at
// https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
// including this file, may be copied, modified, propagated, or distributed
// except according to the terms contained in the LICENSE file.

module.exports = {
  down: () => { throw new Error('down() not yet supported for this migration'); },
  up: async (db) => {
    require('../migrate').patchRaw(db);
    await db.raw(`update "audits" set "action" = $1 where "action" = $2`, 'form.attachment.update', 'attachment.update');
    await db.raw(`
            update audits
              set details = jsonb_build_object('roleId', details->'role')
                || jsonb_build_object('grantedActeeId', details->'acteeId')
              where action = 'assignment.create';`);
    await db.raw(`
            update audits
              set details = jsonb_build_object('roleId', details->'role')
                || jsonb_build_object('revokedActeeId', details->'acteeId')
              where action = 'assignment.delete';`);
    await db.raw(`
            update audits
              set details = jsonb_build_object('data', details)
              where action = 'project.update';`);
  },
};
