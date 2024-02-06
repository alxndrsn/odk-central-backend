module.exports = {
  up: (db) => {
    db.raw(`
          update audits aus set action=(acs.type || '.' || aus.action)
            from actors acs
            where aus.action in ('session.end', 'assignment.create', 'assignment.delete')
              and aus."acteeId"=acs."acteeId" and type is not null`);
  },
};
