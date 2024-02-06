module.exports = {
  up: (db) => {
    db.raw(`
        update form_defs set "publishedAt"="loggedAt"
          from (select (details->>'newDefId')::int as "publishedId", "loggedAt"
            from audits
            where action = 'form.update.publish') as publishes
          where "publishedId"=form_defs.id
            and "publishedAt" is null;
        `);
  },
};
