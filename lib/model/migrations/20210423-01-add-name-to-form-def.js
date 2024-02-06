module.exports = {
  up: (db) => {
    db.raw(`alter table "form_defs" add column "name" text`);
    db.raw(`ALTER TABLE form_defs DISABLE TRIGGER check_managed_key`);
    db.raw(`update form_defs
        set name = (xpath(
          '/*[local-name() = ''html'']/*[local-name() = ''head'']/*[local-name() = ''title'']/text()',
          xml::xml
        ))[1]::text
        where xml_is_well_formed_document(xml)`);
    db.raw(`ALTER TABLE form_defs ENABLE TRIGGER check_managed_key`);
  },
};
