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

// Take care when changing these values - they should probably remain identical to those in the db
// migration where they were first defined - "actee-id-as-uuid".
const strSpecial = {
  '*':        '00000000-0000-0000-0000-000000000001', // eslint-disable-line key-spacing
  actor:      '00000000-0000-0000-0000-000000000002', // eslint-disable-line key-spacing
  group:      '00000000-0000-0000-0000-000000000003', // eslint-disable-line key-spacing
  user:       '00000000-0000-0000-0000-000000000004', // eslint-disable-line key-spacing
  form:       '00000000-0000-0000-0000-000000000005', // eslint-disable-line key-spacing
  submission: '00000000-0000-0000-0000-000000000006', // eslint-disable-line key-spacing
  field_key:  '00000000-0000-0000-0000-000000000007', // eslint-disable-line key-spacing
  config:     '00000000-0000-0000-0000-000000000008', // eslint-disable-line key-spacing
  project:    '00000000-0000-0000-0000-000000000009', // eslint-disable-line key-spacing
  role:       '00000000-0000-0000-0000-000000000010', // eslint-disable-line key-spacing
  assignment: '00000000-0000-0000-0000-000000000011', // eslint-disable-line key-spacing
  audit:      '00000000-0000-0000-0000-000000000012', // eslint-disable-line key-spacing
};

const sqlSpecial = {};
for (const [ k, v ] of Object.entries(strSpecial)) {
  sqlSpecial[k] = sql`'${v}'`;
}

module.exports = { provision, strSpecial, sqlSpecial };

