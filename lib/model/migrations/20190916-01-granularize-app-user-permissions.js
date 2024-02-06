module.exports = {
  up: (db) => {
    db.raw(`alter table "field_keys" add column "projectId" integer`);
    db.raw(`alter table "field_keys" add constraint "field_keys_projectid_foreign" foreign key ("projectId") references "projects" ("id")`);
    db.raw(`create index "field_keys_actorid_projectid_index" on "field_keys" ("actorId", "projectId")`);
    db.raw(`
            update field_keys set "projectId" = projects.id
              from assignments, projects
              where assignments."actorId" = field_keys."actorId"
                and projects."acteeId" = assignments."acteeId";
          `);
    db.raw(`
            insert into assignments ("actorId", "roleId", "acteeId")
              select
                  assignments."actorId",
                  (select id from roles where system = 'app_user'),
                  forms."acteeId"
                from roles
                inner join assignments on assignments."roleId" = roles.id
                inner join projects on projects."acteeId" = assignments."acteeId"
                inner join forms on forms."projectId" = projects.id
                where roles.system = 'app_user';
          `);
    db.raw(`
            delete from assignments
              using projects, field_keys
              where assignments."acteeId" = projects."acteeId"
                and assignments."actorId" = field_keys."actorId";
          `);
  },
};
