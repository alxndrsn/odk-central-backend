module.exports = {
  up: (db) => {
    db.raw(`
        create or replace function check_review_state() returns trigger as $check_review_state$
          begin
            if NEW."reviewState" is not null and NEW."reviewState" not in ('hasIssues', 'edited', 'approved', 'rejected') then
              raise exception 'ODK03:%', NEW."reviewState";
            end if;
            return NEW;
          end;
        $check_review_state$ language plpgsql;
        `);
  },
};
