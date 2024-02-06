module.exports = {
  up: (db) => {
    db.raw(`
        create or replace function check_form_state() returns trigger as $check_form_state$
          begin
            if NEW.state is null or NEW.state not in ('draft', 'open', 'closing', 'closed') then
              raise exception 'ODK03:%', NEW.state;
            end if;
            return NEW;
          end;
        $check_form_state$ language plpgsql;
        `);
    db.raw(`create trigger check_form_state before insert or update on forms
            for each row execute procedure check_form_state();`);
  },
};
