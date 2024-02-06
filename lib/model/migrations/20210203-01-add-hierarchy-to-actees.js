module.exports = {
  up: (db) => {
    db.raw(`update actees set species='*' where species='species'`);
    db.raw(`alter table "actees" add column "parent" varchar(36)`);
    db.raw(`create index "actees_parent_index" on "actees" ("parent")`);
    db.raw(`
        update actees set parent=projects."acteeId"
        from forms, projects
        where forms."projectId"=projects.id
          and forms."acteeId"=actees.id`);
    db.raw(`
        update actees set parent=projects."acteeId"
        from actors, field_keys, projects
        where field_keys."projectId"=projects.id
          and field_keys."actorId"=actors.id
          and actors."acteeId"=actees.id`);
    db.raw(`
        update actees set parent=forms."acteeId"
        from actors, public_links, forms
        where public_links."formId"=forms.id
          and public_links."actorId"=actors.id
          and actors."acteeId"=actees.id`);
    db.raw(`insert into "actees" ("id", "species") values ($1, $2)`, 'audit', '*');
  },
};
