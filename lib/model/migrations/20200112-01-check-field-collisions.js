module.exports = {
  up: (db) => {
    db.raw(`
        create or replace function check_field_collisions() returns trigger as $check_field_collisions$
          declare extant int;
          declare extformid int;
          declare extpath text;
          declare exttype text;
          begin
            select count(distinct type), "formId", path into extant, extformid, extpath
              from form_fields
              left outer join (select id from form_defs where "publishedAt" is not null) as form_defs
                on form_defs.id = form_fields."formDefId"
              left outer join (select id, "draftDefId" from forms) as forms
                on forms."draftDefId" = form_fields."formDefId"
              where forms.id is not null or form_defs.id is not null
              group by form_fields."formId", path having count(distinct type) > 1;
        
            if extant > 0 then
              select type into exttype
                from form_fields
                where "formId" = extformid and path = extpath
                order by "formDefId" asc
                limit 1;
        
              raise exception using message = format('ODK05:%s:%s', extpath, exttype);
            end if;
        
            return NEW;
          end;
        $check_field_collisions$ language plpgsql;
        `);
    db.raw(`create trigger check_field_collisions after insert on form_fields
            for each row execute procedure check_field_collisions();`);
  },
};
