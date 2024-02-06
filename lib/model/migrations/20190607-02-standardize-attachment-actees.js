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
    await db.raw(`
            update audits
              set
                "acteeId" = forms."acteeId",
                details = details
                  || jsonb_build_object('formDefId', form_attachments."formDefId")
                  || jsonb_build_object('name', form_attachments.name)
              from form_attachments, forms
              where
                audits."acteeId" = form_attachments."acteeId" and
                forms.id = form_attachments."formId" and
                action = 'form.attachment.update';`);
    await db.raw(`alter table "form_attachments" drop column "acteeId"`);
    await db.raw(`delete from actees where species = 'form_attachment';`);
  },
};
