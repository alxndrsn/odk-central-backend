module.exports = {
  up: (db) => {
    db.raw(`
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
    db.raw(`create trigger check_managed_key after insert or update on form_defs
            for each row execute procedure check_managed_key();`);
  },
};
