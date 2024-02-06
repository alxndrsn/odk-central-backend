module.exports = {
  up: (db) => {
    db.raw(`
        delete from form_defs
        using forms
        where form_defs."formId" = forms.id
        and form_defs."publishedAt" is null
        and form_defs.id is distinct from forms."draftDefId"`);
  },
};
