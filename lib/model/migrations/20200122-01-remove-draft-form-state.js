module.exports = {
  up: (db) => {
    db.raw(`
        create or replace function check_form_state() returns trigger as $check_form_state$
          begin
            if NEW.state is null or NEW.state not in ('open', 'closing', 'closed') then
              raise exception 'ODK03:%', NEW.state;
            end if;
            return NEW;
          end;
        $check_form_state$ language plpgsql;
        `);
  },
};
