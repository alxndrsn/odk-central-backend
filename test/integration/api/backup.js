const { testService } = require('../setup');
const { httpZipResponseToFiles } = require('../../util/zip');

describe.only('api: /backup', () => {
  describe('POST', function () {
    this.timeout(10000);
    it('should reject if the user cannot backup', testService((service) =>
      service.login('chelsea', (asChelsea) =>
        asChelsea.post('/v1/backup').expect(403))));

    it('should return TODO if the user can backup @slow', testService((service) => {
      return service.login('alice', (asAlice) =>
        httpZipResponseToFiles(asAlice.post('/v1/backup').expect(200))
          .then(res => {
          }));
    }));
  });
});

