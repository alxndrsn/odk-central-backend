module.exports = {
  up: (db) => {
    db.raw(`drop trigger check_field_collisions on form_fields`);
    db.raw(`create trigger check_field_collisions after insert on form_fields
            for each statement execute procedure check_field_collisions();`);
  },
};
