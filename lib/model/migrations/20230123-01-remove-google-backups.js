module.exports = {
  up: (db) => {
    db.raw(`DELETE FROM config WHERE key IN ('backups.main', 'backups.google')`);
    db.raw(`select "id" from "roles" where "system" = $1`, 'initbkup');
    db.raw(`UPDATE actors SET "deletedAt" = now()
        FROM assignments
        WHERE
          assignments."actorId" = actors.id AND
          assignments."roleId" = $1 AND
          actors.type = 'singleUse'`, '4');
    db.raw(`DELETE FROM sessions WHERE "actorId" IN (
          SELECT id FROM actors
          JOIN assignments ON
            assignments."actorId" = actors.id AND
            assignments."roleId" = $1
          WHERE actors.type = 'singleUse'
        )`, '4');
    db.raw(`DELETE FROM assignments WHERE "roleId" = $1`, '4');
    db.raw(`DELETE FROM roles WHERE id = $1`, '4');
  },
};
