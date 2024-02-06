module.exports = {
  up: (db) => {
    db.raw(`
            update audits
              set
                "acteeId" = forms."acteeId",
                details = details
                  || jsonb_build_object('formDefId', form_attachments."formDefId")
                  || jsonb_build_object('name', form_attachments.name)
              from form_attachments, forms
              where
                audits."acteeId" = form_attachments."acteeId" and
                forms.id = form_attachments."formId" and
                action = 'form.attachment.update';`);
    db.raw(`alter table "form_attachments" drop column "acteeId"`);
    db.raw(`delete from actees where species = 'form_attachment';`);
  },
};
