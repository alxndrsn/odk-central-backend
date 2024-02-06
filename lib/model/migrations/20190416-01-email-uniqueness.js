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
        create or replace function check_email() returns trigger as $check_email$
          declare extant int;
          begin
            select count(*) into extant from users inner join
              (select id from actors where "deletedAt" is null and id != NEW."actorId")
                as actors on actors.id=users."actorId"
              where email=NEW.email limit 1;
            if extant > 0 then
              raise exception 'ODK01:%', NEW.email;
            end if;
            return NEW;
          end;
        $check_email$ language plpgsql;
        `);
    await db.raw(`alter table users drop constraint users_email_unique;`);
    await db.raw(`create trigger check_email before insert or update on users
            for each row execute procedure check_email();`);
  },
};
