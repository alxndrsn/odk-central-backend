const should = require('should');
const { testService } = require('../setup');

describe('http', () => {
  it('should return 404 for path URL decode errors', testService(async (service) => {
    const { body } = await service.get('/v1/%')
      .expect(404);

    body.should.deepEqual({
      code: 404.1,
      message: 'Could not find the resource you were looking for.',
    });
  }));

  it('should use weak ETags', testService(async (service) => {
    const { body, headers } = await service.get('/v1/roles') // endpoint chosen as it's open
      .expect(200);

    const { etag } = headers;
    etag.should.match(/^W\/".*"$/);

    await service.get('/v1/roles')
        .set('If-None-Match', etag)
        .expect(304);
  }));

  it('should not set ETags for 404 routes', testService(async (service) => {
    const { body, headers } = await service.get('/v1/%')
      .expect(404);

    should(headers.etag).be.undefined();
  }));

  it('should not set ETags for every route', testService(async (service) => {
    const { body, headers } = await service.get('/v1/roles') // endpoint chosen as it's open
      .expect(200);

    should(headers.etag).be.undefined();
  }));
});
