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

const { Client } = require('pg');
const { program } = require('commander');

program.option('-l, --log', 'Print all db statements to log.');
program.parse();
const { log } = program.opts();

const connect = async database => {
  const db = new Client({ host: 'localhost', user: 'postgres', password: 'odktest', database:'postgres' });
  await db.connect();
  return db;
};

(async () => {
  const dbmain = await connect('postgres');

  await dbmain.query("create user jubilant with password 'jubilant';");
  await Promise.all(['jubilant', 'jubilant_test'].map(async (database) => {
    await dbmain.query(`create database ${database} with owner=jubilant encoding=UTF8;`);
    const dbj = await connect(database);
    await dbj.query('create extension citext;');
    await dbj.query('create extension pg_trgm;');
    await dbj.query('create extension pgrowlocks;');
    dbj.end();
  }));

  if (log) {
    await dbmain.query("alter system set log_destination to 'stderr';");
    await dbmain.query('alter system set logging_collector to on;');
    await dbmain.query("alter system set log_statement to 'all';");
    await dbmain.query('alter system set log_parameter_max_length to 80');
    await dbmain.query('select pg_reload_conf();');
  }

  await dbmain.end();
})();
