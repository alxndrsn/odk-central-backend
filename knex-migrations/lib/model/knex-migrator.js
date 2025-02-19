// Copyright 2017 ODK Central Developers
// See the NOTICE file at the top-level directory of this distribution and at
// https://github.com/getodk/central-backend/blob/master/NOTICE.
// This file is part of ODK Central. It is subject to the license terms in
// the LICENSE file found in the top-level directory of this distribution and at
// https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
// including this file, may be copied, modified, propagated, or distributed
// except according to the terms contained in the LICENSE file.
//
// This is a variety of functions helpful for connecting to and performing
// top-level operations with a database, like migrations.

const knex = require('knex');

const validateConfig = (config) => {
  const { host, port, database, user, password, ssl, maximumPoolSize, ...unsupported } = config;

  if (ssl != null && ssl !== true)
    throw new Error('Invalid database config: if ssl is specified, its value can only be true.');

  const unsupportedKeys = Object.keys(unsupported);
  if (unsupportedKeys.length !== 0)
    throw new Error(`Invalid database config: '${unsupportedKeys[0]}' is unknown or is not supported.`);
};

// Returns an object that Knex will use to connect to the database.
const knexConnection = (config) => {
  const problem = validateConfig(config);
  if (problem != null) throw problem;
  // We ignore maximumPoolSize when using Knex.
  const { maximumPoolSize, ...knexConfig } = config;
  if (knexConfig.ssl === true) {
    // Slonik seems to specify `false` for `rejectUnauthorized` whenever SSL is
    // specified:
    // https://github.com/gajus/slonik/issues/159#issuecomment-891089466. We do
    // the same here so that Knex will connect to the database in the same way
    // as Slonik.
    knexConfig.ssl = { rejectUnauthorized: false };
  }
  return knexConfig;
};

// Connects to the postgres database specified in configuration and returns it.
const knexConnect = (config) => knex({ client: 'pg', connection: knexConnection(config) });

// Connects to a database, passes it to a function for operations, then ensures its closure.
const withKnex = (config) => (mutator) => {
  const db = knexConnect(config);
  return mutator(db).finally(() => db.destroy());
};

// Given a database, initiates migrations on it.
const migrate = (db) => db.migrate.latest({ directory: `${__dirname}/migrations` });

// Checks for pending migrations and returns an exit code of 1 if any are
// still pending/unapplied (e.g. automatically running migrations just failed).
const checkMigrations = (db) => db.migrate.list({ directory: `${__dirname}/migrations` })
  .then((res) => {
    if (res[1].length > 0)
      process.exitCode = 1;
  });

module.exports = { checkMigrations, knexConnect, withKnex, migrate };

