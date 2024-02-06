module.exports = {
  up: (db) => {
    db.raw(`alter table "form_attachments" add column "updatedAt" timestamptz`);
    db.raw(`
            with logs as (
              select details->>'formDefId' as "defId", details->>'name' as name, max("loggedAt") as at
                from audits
                where action = 'form.attachment.update'
                group by details->>'formDefId', details->>'name')
            update form_attachments
              set "updatedAt" = logs.at
              from logs
              where
                form_attachments."formDefId"::text = logs."defId" and
                form_attachments.name = logs.name;`);
  },
};
