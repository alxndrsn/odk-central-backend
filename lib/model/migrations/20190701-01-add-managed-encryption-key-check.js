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
        create or replace function check_managed_key() returns trigger as $check_managed_key$
          declare "projectKeyId" int;
          begin
            select "keyId" into "projectKeyId" from forms
              inner join projects on projects.id = forms."projectId"
              where forms.id = NEW."formId";
            if "projectKeyId" is not null and NEW."keyId" is null then
              raise exception 'ODK04';
            end if;
            return NEW;
          end;
        $check_managed_key$ language plpgsql;
        `);
    await db.raw(`create trigger check_managed_key after insert or update on form_defs
            for each row execute procedure check_managed_key();`);
  },
};
