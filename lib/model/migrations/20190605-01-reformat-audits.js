module.exports = {
  up: (db) => {
    db.raw(`update "audits" set "action" = $1 where "action" = $2`, 'form.attachment.update', 'attachment.update');
    db.raw(`
            update audits
              set details = jsonb_build_object('roleId', details->'role')
                || jsonb_build_object('grantedActeeId', details->'acteeId')
              where action = 'assignment.create';`);
    db.raw(`
            update audits
              set details = jsonb_build_object('roleId', details->'role')
                || jsonb_build_object('revokedActeeId', details->'acteeId')
              where action = 'assignment.delete';`);
    db.raw(`
            update audits
              set details = jsonb_build_object('data', details)
              where action = 'project.update';`);
  },
};
