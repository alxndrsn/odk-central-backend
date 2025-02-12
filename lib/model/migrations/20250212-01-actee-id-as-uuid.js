// Copyright 2025 ODK Central Developers
// See the NOTICE file at the top-level directory of this distribution and at
// https://github.com/getodk/central-backend/blob/master/NOTICE.
// This file is part of ODK Central. It is subject to the license terms in
// the LICENSE file found in the top-level directory of this distribution and at
// https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
// including this file, may be copied, modified, propagated, or distributed
// except according to the terms contained in the LICENSE file.

/* eslint-disable key-spacing, indent */

const fkTables = [
  'actors',
  'assignments',
  'audits',
  'datasets',
  'forms',
  'form_attachments',
  'grants',
  'projects',
];

const specialActees = {
  '*':        '00000000-0000-0000-0000-000000000001',
  actor:      '00000000-0000-0000-0000-000000000002',
  group:      '00000000-0000-0000-0000-000000000003',
  user:       '00000000-0000-0000-0000-000000000004',
  form:       '00000000-0000-0000-0000-000000000005',
  submission: '00000000-0000-0000-0000-000000000006',
  field_key:  '00000000-0000-0000-0000-000000000007',
  config:     '00000000-0000-0000-0000-000000000008',
  project:    '00000000-0000-0000-0000-000000000009',
  role:       '00000000-0000-0000-0000-000000000010',
  assignment: '00000000-0000-0000-0000-000000000011',
  audit:      '00000000-0000-0000-0000-000000000012',
};
if (Object.keys(specialActees).length !==
    new Set(Object.values(specialActees)).size) {
  throw new Error('Check specialActees values are unique');
}

const tableName = t => t.padStart(15, ' ');

const up = (db) => db.raw(`
  -- drop constraints
  ${fkTables.map(t => `ALTER TABLE ${tableName(t)} DROP CONSTRAINT IF EXISTS ${t}_acteeid_foreign;`).join('\n  ')}

  -- update references to their special values
  ${Object.entries(specialActees).flatMap(([ str, uuid ]) => [
                         `UPDATE          actees SET        id='${uuid}' WHERE        id='${str}';`,
    ...fkTables.map(t => `UPDATE ${tableName(t)} SET "acteeId"='${uuid}' WHERE "acteeId"='${str}';`),
  ]).join('\n  ')}

  -- change column types
  ALTER TABLE actees ALTER COLUMN id TYPE UUID USING id::UUID;
  ${fkTables.map(t => `ALTER TABLE ${tableName(t)} ALTER COLUMN "acteeId" TYPE UUID USING "acteeId"::UUID;`).join('\n  ')}

  -- re-add constraints
  ${fkTables.map(t => `ALTER TABLE ${tableName(t)} ADD CONSTRAINT ${t}_acteeid_foreign FOREIGN KEY("acteeId") REFERENCES actees(id);`).join('\n  ')}
`);

const down = (db) => db.raw(`
  -- TODO reverse all statements from up()
`);

module.exports = { up, down };
