module.exports = {
  up: (db) => {
    db.raw(`
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
    db.raw(`alter table users drop constraint users_email_unique;`);
    db.raw(`create trigger check_email before insert or update on users
            for each row execute procedure check_email();`);
  },
};
