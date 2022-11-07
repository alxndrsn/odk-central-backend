// Copyright 2017 ODK Central Developers
// See the NOTICE file at the top-level directory of this distribution and at
// https://github.com/getodk/central-backend/blob/master/NOTICE.
// This file is part of ODK Central. It is subject to the license terms in
// the LICENSE file found in the top-level directory of this distribution and at
// https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
// including this file, may be copied, modified, propagated, or distributed
// except according to the terms contained in the LICENSE file.
//
// This is the main entrypoint for the actual HTTP server. It sets up the
// dependency container and feeds it to the service infrastructure.

const { mergeRight } = require('ramda');
const config = require('config');
const exit = require('express-graceful-exit');

global.tap = (x) => { console.log(x); return x; }; // eslint-disable-line no-console

////////////////////////////////////////////////////////////////////////////////
// CONTAINER SETUP

// initialize our slonik connection pool.
const { slonikPool } = require('../external/slonik');
const db = slonikPool(config.get('default.database'));

// set up our mailer.
const env = config.get('default.env');
const { mailer } = require('../external/mail');
const mail = mailer(mergeRight(config.get('default.email'), { env }));

// get a google client.
const googler = require('../external/google');
const google = googler(config.get('default.external.google'));

// get a sentry and configure errors.
const Sentry = require('../external/sentry').init(config.get('default.external.sentry'));
Error.stackTrackLimit = 20;

// get an xlsform client and a password module.
const xlsform = require('../external/xlsform').init(config.get('default.xlsform'));
const bcrypt = require('../util/crypto').password(require('bcrypt'));

// get an Enketo client
const enketo = require('../external/enketo').init(config.get('default.enketo'));


////////////////////////////////////////////////////////////////////////////////
// START HTTP SERVICE

// initialize our container, then generate an http service out of it.
const container = require('../model/container')
  .withDefaults({ db, mail, env, google, Sentry, bcrypt, xlsform, enketo });
const service = require('../http/service')(container);

service.use((err, req, res, next) => {
  if(err.code === 'ERR_STREAM_PREMATURE_CLOSE') { // https://github.com/nodejs/node/search?q=ERR_STREAM_PREMATURE_CLOSE
    // can happen for either reader or writer closing unexpectedly: https://github.com/nodejs/node/blob/main/lib/internal/streams/end-of-stream.js#L140-L149
    if(res.destroyed || res.finished) {
      // nothing we can do for the response
      // TODO should we still be logging this, or can we trust it's only ever throw correctly?
      console.log('ERR_STREAM_PREMATURE_CLOSE.  Response already closed - ignoring error.');
      return;
    }
    console.log('ERR_STREAM_PREMATURE_CLOSE.  Response not closed - falling through.');
    console.log(req);
    console.log('===============================================');
    console.log(res);
  } else {
    next(err);
  }
});

// insert the graceful exit middleware.
service.use(exit.middleware(service));

// start the service.
const server = service.listen(config.get('default.server.port'), () => {
  // notify parent process we are alive if applicable.
  if (process.send != null) process.send('online');
});

function recordClientError(err) {
  console.log('recordClientError()', error);
}
server.on('clientError', (error, socket) => {
  console.log('previously unhandled', 'clientError', error);
  console.log('  socket.writable?', socket.writable);
  if (socket.writable) {
    switch(error.code) {
      case 'HPE_HEADER_OVERFLOW':
        socket.write(Buffer.from('HTTP/1.1 431 Request Header Fields Too Large\r\nConnection: close\r\n\r\n', 'ascii'));
        break;
      case 'ERR_HTTP_REQUEST_TIMEOUT':
        socket.write(Buffer.from('HTTP/1.1 408 Request Timeout\r\nConnection: close\r\n\r\n', 'ascii'));
        break;
      default:
        socket.write(Buffer.from('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n', 'ascii'));
    }
//    socket.destroy(error);
  } else {
//    console.log('Socket not writable, so not destroying.');
  }
  socket.destroy(error);
});
server.on('tlsClientError', (error, socket) => {
  console.log('previously unhandled', 'tlsClientError', error);
  socket.destroy(error);
});
// From: https://httptoolkit.com/blog/how-and-why-to-monitor-http-client-errors/
// Takes a new TLS socket, calls the error listener if it's silently closed
function ifTlsDropped(socket, errorCallback) {
  new Promise((resolve, reject) => {
    socket.once('data', resolve);
    socket.once('close', reject);
    socket.once('end', reject);
  })
  .catch(errorCallback); // Called if 'close'/'end' happens before 'data'
}
// Check for this on all new connections:
server.on('secureConnection', socket => ifTlsDropped(socket, () => recordClientError(new Error('TLS connection closed immediately'))));
// TODO we prob don't care about TLS stuff



////////////////////////////////////////////////////////////////////////////////
// START WORKER

const { worker } = require('../worker/worker');
worker(container);


////////////////////////////////////////////////////////////////////////////////
// CLEANUP

let termed = false;
const term = () => {
  if (termed === true) {
    process.stderr.write('got INT/TERM a second time; exiting forcefully.\n');
    return process.exit(-1);
  }
  termed = true;

  exit.gracefulExitHandler(service, server, {
    log: true,
    exitProcess: false,
    callback: () => db.end().then(() => process.exit(0))
  });
};

process.on('SIGINT', term); // ^C
process.on('SIGTERM', term);

process.on('message', (message) => { // parent process.
  if (message === 'shutdown') term();
});

