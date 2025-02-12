// Copyright 2025 ODK Central Developers
// See the NOTICE file at the top-level directory of this distribution and at
// https://github.com/getodk/central-backend/blob/master/NOTICE.
// This file is part of ODK Central. It is subject to the license terms in
// the LICENSE file found in the top-level directory of this distribution and at
// https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
// including this file, may be copied, modified, propagated, or distributed
// except according to the terms contained in the LICENSE file.

const fkTables = [
  'actors',
  'assignments',
  'audits',
  'forms',
];

const  strActeeStar = '*';
const uuidActeeStar = '00000000-0000-0000-0000-000000000001';

const up = (db) => db.raw(`
  -- drop constraints
  ${fkTables.map(t => `ALTER TABLE ${t} DROP CONSTRAINT ${t}_acteeid_foreign;`).join('\n  ')}

  -- update references to their special values
  ${fkTables.map(t => `UPDATE ${t} SET "acteeId"='${uuidActeeStar}' WHERE "acteeId"='${strActeeStar}';`).join('\n  ')}

  -- change column types
  ALTER TABLE actees ALTER COLUMN id        TYPE UUID USING id::UUID;
  ALTER TABLE actors ALTER COLUMN "acteeId" TYPE UUID USING "acteeId"::UUID;
  ALTER TABLE forms  ALTER COLUMN "acteeId" TYPE UUID USING "acteeId"::UUID;

  -- re-add constraints
  ${fkTables.map(t => `ALTER TABLE ${t} ADD CONSTRAINT ${t}_acteeid_foreign FOREIGN KEY("acteesId") REFERENCES actees(id);`).join('\n  ')}
`);

const down = (db) => db.raw(`
  ALTER TABLE actees ALTER COLUMN id TYPE VARCHAR(36) USING id::TEXT;
  -- TODO reverse all statements from up()
`);

module.exports = { up, down };
