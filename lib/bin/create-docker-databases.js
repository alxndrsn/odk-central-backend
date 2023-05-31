// Copyright 2022 ODK Central Developers
// See the NOTICE file at the top-level directory of this distribution and at
// https://github.com/getodk/central-backend/blob/master/NOTICE.
// This file is part of ODK Central. It is subject to the license terms in
// the LICENSE file found in the top-level directory of this distribution and at
// https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
// including this file, may be copied, modified, propagated, or distributed
// except according to the terms contained in the LICENSE file.

// This script creates the databases jubilant and jubilant_test. It is meant to
// be run in a Docker environment in which the POSTGRES_PASSWORD environment
// variable is set to 'odktest'.

const cli = require('cli');
const knex = require('knex');

const connect = (database) => knex({
  client: 'pg',
  connection: { host: 'localhost', user: 'postgres', password: 'odktest', database }
});

cli.parse({
  log: ['l', 'Print all db statements to log.', 'bool']
});
cli.main(async (_, { log }) => {
  const dbmain = connect('postgres');
  await dbmain.raw(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT FROM pg_user WHERE usename='jubilant') THEN
        CREATE USER jubilant WITH PASSWORD 'jubilant';
      END IF;
    END $$
  `);
  await Promise.all(['jubilant', 'jubilant_test'].map(async (database) => {
    await dbmain.raw(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT FROM pg_database WHERE datname='${database}') THEN
          CREATE DATABASE ${database} WITH owner=jubilant encoding=UTF8;
        END IF;
      END $$
    `);
    const dbj = connect(database);
    await dbj.raw('CREATE EXTENSION IF NOT EXISTS citext;');
    await dbj.raw('CREATE EXTENSION IF NOT EXISTS pg_trgm;');
    dbj.destroy();
  }));

  if (log) {
    await dbmain.raw("alter system set log_destination to 'stderr';");
    await dbmain.raw('alter system set logging_collector to on;');
    await dbmain.raw("alter system set log_statement to 'all';");
    await dbmain.raw('select pg_reload_conf();');
  }

  dbmain.destroy();
});
