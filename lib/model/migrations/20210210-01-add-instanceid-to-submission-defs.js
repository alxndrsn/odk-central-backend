module.exports = {
  up: (db) => {
    db.raw(`alter table "submission_defs" add column "instanceId" varchar(64)`);
    db.raw(`create index "submission_defs_submissionid_instanceid_index" on "submission_defs" ("submissionId", "instanceId")`);
    db.raw(`
        update submission_defs set "instanceId"=submissions."instanceId"
        from submissions where submissions.id=submission_defs."submissionId"`);
    db.raw(`alter table submission_defs alter column "instanceId" set not null`);
    db.raw(`
        create or replace function check_instanceid_unique() returns trigger as $check_instanceid_unique$
          declare fid int;
          declare drft boolean;
          declare found int;
          begin
            select "formId", draft into fid, drft from submissions where submissions.id=NEW."submissionId";
            select count(*) into found from submissions
              join submission_defs on submissions.id=submission_defs."submissionId"
              where "formId"=fid and submission_defs."instanceId"=NEW."instanceId" and draft=drft;
        
            if found > 1 then
              raise exception using message = format('ODK06:%s', NEW."instanceId");
            end if;
        
            return NEW;
          end;
        $check_instanceid_unique$ language plpgsql;`);
    db.raw(`create trigger check_instanceid_unique after insert on submission_defs
            for each row execute procedure check_instanceid_unique();`);
  },
};
