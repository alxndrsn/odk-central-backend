// Copyright 2017 ODK Central Developers
// See the NOTICE file at the top-level directory of this distribution and at
// https://github.com/getodk/central-backend/blob/master/NOTICE.
// This file is part of ODK Central. It is subject to the license terms in
// the LICENSE file found in the top-level directory of this distribution and at
// https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
// including this file, may be copied, modified, propagated, or distributed
// except according to the terms contained in the LICENSE file.

const uuid = require('uuid').v4;
const { sql } = require('slonik');
const { Actee } = require('../frames');
const { construct } = require('../../util/util');

const provision = (species, parent) => ({ one }) =>
  one(sql`insert into actees (id, species, parent) values (${uuid()}, ${species}, ${(parent == null) ? null : parent.acteeId}) returning *`)
    .then(construct(Actee));

const strSpecial = {
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

const sqlSpecial = {};
for (const [ k, v ] of Object.entries(strSpecial)) {
  sqlSpecial[k] = sql`'${v}'`;
}

module.exports = { provision, strSpecial, sqlSpecial };

