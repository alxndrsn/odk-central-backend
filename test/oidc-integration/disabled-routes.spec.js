// TODO move to /test/oidc-integration and use patterns in /test/integration?

const fetch = require('node:fetch');

describe('central-backend', () => {
  describe('routes disabled for OIDC', () => {
    [
      [ 'POST', 'v1/sessions' ],
      [ 'POST', 'v1/users/reset/initiate' ],
      [ 'POST', 'v1/users/reset/verify' ],
      [ 'PUT',  'v1/users/123/password' ],
    ].forEach(([ method, path ]) => {
      it(`should return 404 for ${method} ${path}`, async () => {
        // when
        const res = await emptyRequest(method, path);

        // then
        assert.equal(res.status, 404);
        assert.equal(res.body, 404);
      });
    });
  });

  describe('routes changed for OIDC', () => {
    describe('PATCH /users/:id', () => {
      describe('for a web user', () => {
        it('should allow changing own displayName', async () => {
          // given
          // TODO an authenticated web user

          // when
          // TODO PATCH request made

          // then
          // TODO assert displayName updated
        });

        it('should NOT allow changing own email', async () => {
          // given
          // TODO an authenticated web user

          // when
          // TODO PATCH request made

          // then
          // TODO assert displayName updated
        });
      });

      describe('for an admin user', () => {
        it('should allow changing own displayName', async () => {
          // given
          // TODO an authenticated admin user

          // when
          // TODO PATCH request made

          // then
          // TODO assert displayName updated
        });

        it('should NOT allow changing own email', async () => {
          // given
          // TODO an authenticated admin user

          // when
          // TODO PATCH request made

          // then
          // TODO assert displayName updated
        });

        it(`should allow changing other user's displayName`, async () => {
          // given
          // TODO an authenticated admin user

          // when
          // TODO PATCH request made

          // then
          // TODO assert displayName updated
        });

        it(`should NOT allow changing other user's email`, async () => {
          // given
          // TODO an authenticated admin user

          // when
          // TODO PATCH request made

          // then
          // TODO assert displayName updated
        });
      });
    });
  });
});

async function emptyRequest(method, path) {
  const url = `http://localhost:8383/${path}`;
  const res = await fetch(url, { method }); // TODO maybe requires a body for POST/PUT
  const responseBody = await res.text();
  return { status:res.status, body:responseBody };
}
