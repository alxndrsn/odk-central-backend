const assert = require('node:assert/strict');
const { Readable, Writable } = require('node:stream');

const { PartialPipe } = require('../../../lib/util/stream');
const { testService, testServiceWithAdditionalResources } = require('../setup');

describe('http', () => {
  it('should return 404 for path URL decode errors', testService(async (service) => {
    const { body } = await service.get('/v1/%')
      .expect(404);

    body.should.deepEqual({
      code: 404.1,
      message: 'Could not find the resource you were looking for.',
    });
  }));

  describe('case-sensitive routing', () => {
    it(`should route to /v1/users/current`, testService(async (service) => {
      const { status } = await service.get('/v1/users/current');
      status.should.eql(401);
    }));

    it(`should NOT route to /v1/USERS/current`, testService(async (service) => {
      const { status } = await service.get('/v1/USERS/current');
      status.should.eql(404);
    }));
  });

  describe.only('stream error handling', () => {
    it('should handle piping to a destroyed response', () => {
      const caught = [];

      const deadPipeEndpoint = ({ service, anonymousEndpoint }) => {
        service.get('/dead-pipe', anonymousEndpoint((container, _, req, res) => {
          res.destroy();
          return PartialPipe.of(new Readable({
            read() {
              this.push(`this won't even write one line; ${Math.random()}\n`);
            },
            destroy(err, callback) {
              caught.push(err);
              console.log('stream destroyed', { err, callback });
              clearTimeout(this.timeoutId);
              callback(err);
            },
          }));
        }));
      };

      return testServiceWithAdditionalResources([deadPipeEndpoint], async service => {
        // TODO this should actually return a 500
        await assert.rejects(
          async () => await service.get('/v1/dead-pipe'),
          err => {
            err.code.should.eql('ECONNRESET');
            return true;
          },
        );
        await new Promise(resolve => setTimeout(resolve, 50));

        // then
        caught.length.should.eql(1);
        caught[0].should.be.an.Error();
        caught[0].code.should.eql('ERR_STREAM_UNABLE_TO_PIPE');
      })();
    });

    it('should handle client closing request while stream in progress', () => {
      const caught = [];

      const endlessStreamEndpoint = ({ service, anonymousEndpoint }) => {
        service.get('/endless-stream', anonymousEndpoint(() =>
          PartialPipe.of(new Readable({
            read() {
              if (this.pushInProgress) return;
              this.pushInProgress = true;

              this.timeoutId = setTimeout(() => {
                console.log('stream read() triggered in background');
                this.push(`press control-c when you get bored; ${Math.random()}\n`);
                this.pushInProgress = false;
              }, 333);
            },
            destroy(err, callback) {
              caught.push(err);
              console.log('stream destroyed', { err, callback });
              clearTimeout(this.timeoutId);
              callback(err);
            },
          }))));
      };

      const readBytesThenDestroy = (req, byteCount) => new Promise((resolve, reject) => {
        let bytesRead = 0;

        const handleErrors = emitter => {
          emitter.on('error', err => {
            if(bytesRead >= byteCount) resolve();
            else reject(err);
          });
        };

        req.on('end', () => reject(new Error('req ended.  is that ok?')));

        req.on('request', nativeReq => {
          nativeReq.on('response', res => {
            handleErrors(res);
          });
        });

        req.pipe(new Writable({
          write(chunk, encoding, callback) {
            console.log({ bytesRead, byteCount, chunk });
            if((bytesRead += chunk.byteLength) > byteCount) {
              req.abort();
            } else {
              callback();
            }
          },
        }));
      });

      return testServiceWithAdditionalResources([endlessStreamEndpoint], async service => {
        // given
        console.log('making request...');
        const req = service.get('/v1/endless-stream').buffer(false);

        // when
        console.log('reading then destroying...');
        await readBytesThenDestroy(req, 100);
        console.log('read and destroyed');
        await new Promise(resolve => setTimeout(resolve, 50));

        // then
        caught.length.should.eql(1);
        caught[0].should.be.an.Error();
        caught[0].code.should.eql('ERR_STREAM_PREMATURE_CLOSE');

        req.abort();
      })();
    });
  });
});
