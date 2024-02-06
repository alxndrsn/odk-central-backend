module.exports = {
  up: (db) => {
    db.raw(`alter table "submissions" add column "reviewState" text`);
    db.raw(`
        create or replace function check_review_state() returns trigger as $check_review_state$
          begin
            if NEW."reviewState" is not null and NEW."reviewState" not in ('hasIssues', 'needsReview', 'approved', 'rejected') then
              raise exception 'ODK03:%', NEW."reviewState";
            end if;
            return NEW;
          end;
        $check_review_state$ language plpgsql;
        `);
    db.raw(`create trigger check_review_state before insert or update on submissions
            for each row execute procedure check_review_state();`);
  },
};
