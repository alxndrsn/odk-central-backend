const { sql } = require('slonik');

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

const uuidFor = acteeId => {
  process.stdout.write('\nhelo\n');
  console.log('uuidFor()', acteeId);
  let res;
  if (Object.prototype.hasOwnProperty.call(sqlSpecial, acteeId)) res = sqlSpecial[acteeId];
  res = acteeId;
  console.log('uuidFor()', acteeId, res);
  return res;
};

module.exports = { strSpecial, sqlSpecial, uuidFor };
