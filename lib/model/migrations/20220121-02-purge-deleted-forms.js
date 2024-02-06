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
    await db.raw(`
        with redacted_audits as (
            update audits set notes = ''
            from forms
            where audits."acteeId" = forms."acteeId"
            and forms."deletedAt" is not null
          ), purge_audits as (
            insert into audits ("action", "acteeId", "loggedAt", "processed")
            select 'form.purge', "acteeId", clock_timestamp(), clock_timestamp()
            from forms
            where forms."deletedAt" is not null
          ), update_actees as (
            update actees set "purgedAt" = clock_timestamp(),
              "purgedName" = form_defs."name",
              "details" = json_build_object('projectId', forms."projectId",
                                            'formId', forms.id,
                                            'xmlFormId', forms."xmlFormId",
                                            'deletedAt', forms."deletedAt",
                                            'version', form_defs."version")
            from forms
            left outer join form_defs on coalesce(forms."currentDefId", forms."draftDefId") = form_defs.id
            where actees.id = forms."acteeId"
            and forms."deletedAt" is not null
          ), deleted_forms as (
            delete from forms
            where forms."deletedAt" is not null
            returning *
          )
        select "id" from deleted_forms`);
    await db.raw(`
        delete from blobs
          using blobs as b
          left join client_audits as ca on ca."blobId" = b.id
          left join submission_attachments as sa on sa."blobId" = b.id
          left join form_attachments as fa on fa."blobId" = b.id
          left join form_defs as fd on fd."xlsBlobId" = b.id
        where (blobs.id = b.id and
          ca."blobId" is null and
          sa."blobId" is null and
          fa."blobId" is null and
          fd."xlsBlobId" is null)`);
  },
};
