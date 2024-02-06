// Copyright 2024 ODK Central Developers
// See the NOTICE file at the top-level directory of this distribution and at
// https://github.com/getodk/central-backend/blob/master/NOTICE.
// This file is part of ODK Central. It is subject to the license terms in
// the LICENSE file found in the top-level directory of this distribution and at
// https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
// including this file, may be copied, modified, propagated, or distributed
// except according to the terms contained in the LICENSE file.

module.exports = {
  up: (db) => {
    db.raw(`alter table "form_defs" add column "publishedAt" timestamptz`);
    db.raw(`create index "form_defs_formid_publishedat_index" on "form_defs" ("formId", "publishedAt")`);
    db.raw(`
	update form_defs set "publishedAt" = form_defs."createdAt"
	  from forms
	  where forms.id = form_defs."formId" and forms."currentDefId" = form_defs.id and forms."deletedAt" is null
	`);
    db.raw(`alter table "forms" add column "draftDefId" integer`);
    db.raw(`alter table "forms" add constraint "forms_draftdefid_foreign" foreign key ("draftDefId") references "form_defs" ("id")`);
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
	      where "publishedAt" is not null
	      group by "projectId", "xmlFormId", version
	      having count(form_defs.id) > 1;
	
	    if extant > 0 then
	      raise exception using message = format('ODK02:%s:%L:%L', pid, xmlid, vstr);
	    end if;
	
	    return NEW;
	  end;
	$check_form_version$ language plpgsql;
	`);
  },
};
