const appRoot = require('app-root-path');
const { sql } = require('slonik');
const { testService, testContainer } = require('../setup');
const { createReadStream, readFileSync } = require('fs');
const { v4: uuid } = require('uuid');

const { promisify } = require('util');
const testData = require('../../data/xml');
const { Form } = require(appRoot + '/lib/model/frames');
const { exhaust, workerQueue } = require(appRoot + '/lib/worker/worker');
const { verifyPassword } = require('../util/crypto');

describe.only('Users', () => {
  describe('#updatePassword()', () => {
    const email = 'test-user-for-password-changing@example.test';

    it("should change a user's password", testService(async (service, { Users }) => {
      // given
      const insertedUser = await Users.create(User.fromApi({ email }).forV1OnlyCopyEmailToDisplayName());
      const newPassword = uuid();

      // when
      await Users.updatePassword(insertedUser, newPassword);
      // and
      const refreshedUser = await Users.getByEmail(email);

      // then
      await verifyPassword(user.password, newPassword);
    }));

    it('should reject a weak password', testService(async (service, { Users }) => {
      // given
      const insertedUser = await Users.create(User.fromApi({ email }).forV1OnlyCopyEmailToDisplayName());
      const newPassword = 'hunter2';

      // expect
      await Users.updatePassword(insertedUser, newPassword)
        .should.be.rejectedWith(Problem, { problemCode: 400.44, message: 'This is a very common password' })
    }));
  });
});
