module.exports = {
  up: (db) => {
    db.raw(`create table "transformations" ("id" serial primary key, "system" varchar(8))`);
    db.raw(`alter table "transformations" add constraint "transformations_system_unique" unique ("system")`);
    db.raw(`insert into "transformations" ("system") values ($1), ($2)`, 'identity', 'void');
    db.raw(`create table "form_defs" ("id" serial primary key, "formId" integer, "transformationId" integer, "xml" text not null, "hash" varchar(32) not null, "sha" varchar(40) not null, "sha256" varchar(64) not null, "version" text not null, "createdAt" timestamptz)`);
    db.raw(`alter table "form_defs" add constraint "form_defs_formid_foreign" foreign key ("formId") references "forms" ("id")`);
    db.raw(`alter table "form_defs" add constraint "form_defs_transformationid_foreign" foreign key ("transformationId") references "transformations" ("id")`);
    db.raw(`alter table "form_defs" add constraint "form_defs_formid_sha256_unique" unique ("formId", "sha256")`);
    db.raw(`alter table "form_attachments" add column "formDefId" integer`);
    db.raw(`alter table "form_attachments" add constraint "form_attachments_formdefid_foreign" foreign key ("formDefId") references "form_defs" ("id")`);
    db.raw(`create table "submission_defs" ("id" serial primary key, "submissionId" integer not null, "xml" text not null, "formDefId" integer not null, "actorId" integer not null, "createdAt" timestamptz)`);
    db.raw(`create index "submission_defs_createdat_index" on "submission_defs" ("createdAt")`);
    db.raw(`create index "submission_defs_id_submissionid_index" on "submission_defs" ("id", "submissionId")`);
    db.raw(`alter table "submission_defs" add constraint "submission_defs_submissionid_foreign" foreign key ("submissionId") references "submissions" ("id")`);
    db.raw(`alter table "submission_defs" add constraint "submission_defs_formdefid_foreign" foreign key ("formDefId") references "form_defs" ("id")`);
    db.raw(`alter table "submission_defs" add constraint "submission_defs_actorid_foreign" foreign key ("actorId") references "actors" ("id")`);
    db.raw(`alter table "submission_attachments" add column "submissionDefId" integer`);
    db.raw(`alter table "submission_attachments" add constraint "submission_attachments_submissiondefid_foreign" foreign key ("submissionDefId") references "submission_defs" ("id")`);
    db.raw(`
            insert into submission_defs ("submissionId", xml, "formDefId", "actorId", "createdAt")
              select
                  submissions.id,
                  submissions.xml,
                  form_defs.id,
                  submissions.submitter,
                  submissions."createdAt"
                from submissions
                left outer join (select id, "formId" from form_defs)
                  as form_defs on form_defs."formId" = submissions."formId";
          `);
    db.raw(`
            update form_attachments set "formDefId" = form_defs.id
              from form_defs
              where form_defs."formId" = form_attachments."formId"
          `);
    db.raw(`
            update submission_attachments set "submissionDefId" = submission_defs.id
              from submission_defs
              where submission_defs."submissionId" = submission_attachments."submissionId"
          `);
    db.raw(`alter table form_attachments drop constraint form_attachments_pkey`);
    db.raw(`alter table "form_attachments" alter column "formDefId" drop default`);
    db.raw(`alter table "form_attachments" alter column "formDefId" drop not null`);
    db.raw(`alter table "form_attachments" alter column "formDefId" type integer using ("formDefId"::integer)`);
    db.raw(`alter table "form_attachments" alter column "formDefId" set not null`);
    db.raw(`alter table "form_attachments" add constraint "form_attachments_pkey" primary key ("formDefId", "name")`);
    db.raw(`alter table submission_attachments drop constraint attachments_pkey`);
    db.raw(`alter table "submission_attachments" alter column "submissionDefId" drop default`);
    db.raw(`alter table "submission_attachments" alter column "submissionDefId" drop not null`);
    db.raw(`alter table "submission_attachments" alter column "submissionDefId" type integer using ("submissionDefId"::integer)`);
    db.raw(`alter table "submission_attachments" alter column "submissionDefId" set not null`);
    db.raw(`alter table "submission_attachments" drop column "submissionId"`);
    db.raw(`alter table "submission_attachments" add constraint "submission_attachments_pkey" primary key ("submissionDefId", "name")`);
    db.raw(`
        create or replace function check_form_version() returns trigger as $check_form_version$
          declare extant int;
          declare pid int;
          declare xmlid text;
          declare vstr text;
          begin
            select count(*), "projectId", "xmlFormId", version into extant, pid, xmlid, vstr
              from form_defs
              inner join (select id, "xmlFormId", "projectId" from forms)
                as forms on forms.id = form_defs."formId"
              group by "projectId", "xmlFormId", version
              having count(form_defs.id) > 1;
        
            if extant > 0 then
              raise exception using message = format('ODK02:%s:%L:%L', pid, xmlid, vstr);
            end if;
        
            return NEW;
          end;
        $check_form_version$ language plpgsql;
        `);
    db.raw(`create trigger check_form_version after insert or update on form_defs
            for each row execute procedure check_form_version();`);
    db.raw(`alter table "forms" add column "currentDefId" integer`);
    db.raw(`alter table "forms" add constraint "forms_currentdefid_foreign" foreign key ("currentDefId") references "form_defs" ("id")`);
    db.raw(`alter table "forms" drop constraint "forms_xmlformid_version_projectid_unique"`);
    db.raw(`alter table "forms" drop column "xml"`);
    db.raw(`alter table "forms" drop column "version"`);
    db.raw(`alter table "forms" drop column "hash"`);
    db.raw(`alter table "submissions" drop column "xml"`);
    db.raw(`alter table "submissions" rename "submitter" to "submitterId"`);
    db.raw(`
            update forms set "currentDefId" = form_defs.id
              from form_defs
              where form_defs."formId" = forms.id
          `);
    db.raw(`
            with all_forms as (select count(*) as count from forms)
              select (count(form_defs.id) = (select count from all_forms)) as success
                from form_defs
                where form_defs.xml is not null;
          `);
    db.raw(`
            with all_forms as (select count(*) as count from forms)
              select (count(form_defs.id) = (select count from all_forms)) as success
                from form_defs
                inner join forms on forms."currentDefId" = form_defs.id;
          `);
    db.raw(`
            with all_defs as (select count(*) as count from form_defs)
              select (count(form_defs.id) = (select count from all_defs)) as success
                from form_defs
                where form_defs.sha is not null and form_defs.sha256 is not null;
          `);
    db.raw(`
            with all_attachments as (select count(*) as count from form_attachments)
              select (count(form_attachments.name) = (select count from all_attachments)) as success
                from form_attachments
                inner join form_defs on form_defs.id = form_attachments."formDefId"
                inner join forms on forms."currentDefId" = form_defs.id
                where form_attachments."formId" = forms.id;
          `);
    db.raw(`
            with all_defs as (select count(*) as count from submission_defs)
              select (count(submission_defs.id) = (select count from all_defs)) as success
                from submission_defs
                inner join submissions on submissions.id = submission_defs."submissionId"
                where submission_defs.xml is not null;
          `);
    db.raw(`
            with all_attachments as (select count(*) as count from submission_attachments)
              select (count(submission_attachments.name) = (select count from all_attachments)) as success
                from submission_attachments
                inner join submission_defs on submission_defs.id = submission_attachments."submissionDefId"
                inner join submissions on submissions.id = submission_defs."submissionId";
          `);
  },
};
