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

const knex = require('knex');
const { program } = require('commander');

const connect = (database) => knex({
  client: 'pg',
  connection: { host: 'localhost', user: 'postgres', password: 'odktest', database }
});

program.option('-l, --log', 'Print all db statements to log.');
program.option('-s, --big-stats', 'Increase max pg_stat_activity.query length.');
program.parse();
const { log, bigStats } = program.opts();

(async () => {
  const dbmain = connect('postgres');
  await dbmain.raw("create user jubilant with password 'jubilant';");
  await Promise.all(['jubilant', 'jubilant_test'].map(async (database) => {
    await dbmain.raw(`create database ${database} with owner=jubilant encoding=UTF8;`);
    const dbj = connect(database);
    await dbj.raw('create extension citext;');
    await dbj.raw('create extension pg_trgm;');
    await dbj.raw('create extension pgrowlocks;');
    dbj.destroy();
  }));

  if (log) {
    await dbmain.raw("alter system set log_destination to 'stderr';");
    await dbmain.raw('alter system set logging_collector to on;');
    await dbmain.raw("alter system set log_statement to 'all';");
    await dbmain.raw('alter system set log_parameter_max_length to 80');
    await dbmain.raw('select pg_reload_conf();');
  }

  if (bigStats) {
    console.log((await dbmain.raw('SHOW track_activity_query_size')).rows[0].track_activity_query_size);
    await dbmain.raw('ALTER SYSTEM SET track_activity_query_size = 16384');
    console.log((await dbmain.raw('SHOW track_activity_query_size')).rows[0].track_activity_query_size);
  }

  dbmain.destroy();
})();
