const assert = require('node:assert/strict');
const { Readable, Writable } = require('node:stream');

const { sql } = require('slonik');

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

    it('should transparently abort fetch() if client closes request while fetch() in progress', () => {
    });

    it.only('should transparently abort db.stream() if client closes request while db.stream() in progress', function() {
      this.timeout(20_000);

      console.log('welcome to the test.');

      let streamAborted = false;

      const endlessStreamDbResource = ({ service, anonymousEndpoint }) => {
        console.log('initialising resource...');
        service.get('/endless-db-stream', anonymousEndpoint(async (container, context, req) => {
          console.log('req.destroyed:', req.destroyed);
          console.log('req.signal:', req.signal);
          console.log('server having a sleep...');

          console.log('starting db stream...');
          const { stream } = container;
          console.log({ stream });
          const str = stream(sql`
            SELECT idx
                 , MD5(idx::TEXT)
                 , PG_SLEEP(0.005)
              FROM GENERATE_SERIES(1, 100000)
                AS series (idx)
          `)
          .then(stream.map(row => {
            console.log('stream.map()', 'req.aborted:', req.signal, 'row:', row);
            return JSON.stringify(row);
          }));
          console.log('str:', str);
          const wrappedStream = await str;
    wrappedStream.on('close', () => { streamAborted = true; });
          console.log('wrappedStream:', wrappedStream);
          return PartialPipe.of(wrappedStream);
        }));
      };

      const readPipe = req => {
      req.on('response', (res) => {
      res.on('error', (err) => {
      if (err.message === 'aborted') return;
      });
      });
        req.on('error', err => { console.log('req error:', err); });
        req.on('end', err => { throw new Error('req ended.  is that ok?', err); });
        req.pipe(new Writable({
          write(chunk, encoding, callback) {
            console.log('read chunk:', chunk.toString());
            callback();
          },
        }));
      };

      return testServiceWithAdditionalResources([endlessStreamDbResource], async service => {
        try {
          console.log('welcome to the actual test body');
          process.on('unhandledRejection', (reason) => {
            console.log('expected rejection abort?', reason);
          });
          process.on('uncaughtException', (reason) => {
            console.log('expected abort?', reason);
            return;
          });
          const req = service.get('/v1/endless-db-stream').buffer(false);
          //req.catch(err => console.log(`
          //  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
          //  @
          //  @
          //  @ supertest error: ${err}
          //  @
          //  @
          //  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
          //`));
          console.log('reading pipe...');
          readPipe(req);
          console.log('sleep #1...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          console.log('woke up #1');

          // when
          req.on('error', err => console.log('req: expected error:', err));
          req.req.on('error', err => {
            console.log('req.req: expected error:', err);
          });
          req.req.destroy();
          console.log('sleep #2...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          console.log('woke up #2');

          // then
          streamAborted.should.be.true();
        } catch(err) {
          console.log('caught in test:', err);
          throw err;
        }
      })();
    });

    it('should handle client closing request before stream in progress', () => {
      let destroyedBeforePipe = false;
      let abortedBeforePipe = false;

      const endlessStreamEndpoint = ({ service, anonymousEndpoint }) => {
        service.get('/endless-stream', anonymousEndpoint(async (container, service, req) => {
          console.log('req.destroyed:', req.destroyed);
          console.log('req.signal:', req.signal);
          console.log('server having a sleep...');
          await new Promise(resolve => setTimeout(resolve, 200));
          console.log('server woke up; retninr partial pipe/...');
          console.log('req.destroyed:', req.destroyed);
          console.log('req.signal:', req.signal);
          destroyedBeforePipe = !!req.destroyed;
          abortedBeforePipe = !!req.signal?.aborted;
          return PartialPipe.of(new Readable({
            read() {
              console.log('stream read() triggered');
              this.push(`press control-c when you get bored; ${Math.random()}\n`);
            },
            destroy(err, callback) {
              console.log('stream destroyed', { err, callback });
              clearTimeout(this.timeoutId);
              callback(err);
            },
          }));
        }));
      };

      const readPipe = req => {
        const handleErrors = emitter => {
          emitter.on('error', err => reject(err));
        };

        req.on('end', () => { throw new Error('req ended.  is that ok?'); });

        req.on('request', nativeReq => {
          nativeReq.on('response', res => {
            handleErrors(res);
          });
        });

        req.pipe(new Writable({
          write(chunk, encoding, callback) {
            console.log('read chunk:', chunk.toString());
          },
        }));
      };

      return testServiceWithAdditionalResources([endlessStreamEndpoint], async service => {
        // given
        console.log('making request...');
        const req = service.get('/v1/endless-stream').buffer(false);

        // when
        console.log('reading then destroying...');
        readPipe(req);
        console.log('started reading; having a sleep...');
        await new Promise(resolve => setTimeout(resolve, 50));
        console.log('destroying req.req ...');
        req.req.destroy();
        console.log('having a sleep so things can clear up n the server');
        await new Promise(resolve => setTimeout(resolve, 300));

        // then
        destroyedBeforePipe.should.be.true();
        abortedBeforePipe.should.be.true();
      })();
    });

    it('should handle client closing request while stream in progress', () => {
      const caught = [];

      const endlessStreamEndpoint = ({ service, anonymousEndpoint }) => {
        service.get('/endless-stream', anonymousEndpoint(() =>
          PartialPipe.of(new Readable({
            read() {
              console.log('stream read() triggered');
              this.push(`press control-c when you get bored; ${Math.random()}\n`);
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
