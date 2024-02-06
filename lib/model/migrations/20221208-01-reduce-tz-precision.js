// Copyright 2024 ODK Central Developers
// See the NOTICE file at the top-level directory of this distribution and at
// https://github.com/getodk/central-backend/blob/master/NOTICE.
// This file is part of ODK Central. It is subject to the license terms in
// the LICENSE file found in the top-level directory of this distribution and at
// https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
// including this file, may be copied, modified, propagated, or distributed
// except according to the terms contained in the LICENSE file.

module.exports = {
  up: (db) => {
    db.raw(`
	  SELECT
	    table_name, JSON_AGG(column_name) AS columns
	  FROM
	    information_schema.columns
	  WHERE table_schema = 'public'
	    AND udt_name = 'timestamptz'
	  GROUP BY table_name`);
    db.raw(`
	  ALTER TABLE actees 
	  ALTER COLUMN "purgedAt" TYPE timestamptz(3)
	`);
    db.raw(`
	  ALTER TABLE actors 
	  ALTER COLUMN "createdAt" TYPE timestamptz(3), ALTER COLUMN "updatedAt" TYPE timestamptz(3), ALTER COLUMN "deletedAt" TYPE timestamptz(3), ALTER COLUMN "expiresAt" TYPE timestamptz(3)
	`);
    db.raw(`
	  ALTER TABLE audits 
	  ALTER COLUMN "claimed" TYPE timestamptz(3), ALTER COLUMN "lastFailure" TYPE timestamptz(3), ALTER COLUMN "processed" TYPE timestamptz(3), ALTER COLUMN "loggedAt" TYPE timestamptz(3)
	`);
    db.raw(`
	  ALTER TABLE comments 
	  ALTER COLUMN "createdAt" TYPE timestamptz(3)
	`);
    db.raw(`
	  ALTER TABLE config 
	  ALTER COLUMN "setAt" TYPE timestamptz(3)
	`);
    db.raw(`
	  ALTER TABLE datasets 
	  ALTER COLUMN "publishedAt" TYPE timestamptz(3), ALTER COLUMN "createdAt" TYPE timestamptz(3)
	`);
    db.raw(`
	  ALTER TABLE ds_properties 
	  ALTER COLUMN "publishedAt" TYPE timestamptz(3)
	`);
    db.raw(`
	  ALTER TABLE entities 
	  ALTER COLUMN "updatedAt" TYPE timestamptz(3), ALTER COLUMN "createdAt" TYPE timestamptz(3)
	`);
    db.raw(`
	  ALTER TABLE entity_defs 
	  ALTER COLUMN "createdAt" TYPE timestamptz(3)
	`);
    db.raw(`
	  ALTER TABLE form_attachments 
	  ALTER COLUMN "updatedAt" TYPE timestamptz(3)
	`);
    db.raw(`
	  ALTER TABLE form_defs 
	  ALTER COLUMN "createdAt" TYPE timestamptz(3), ALTER COLUMN "publishedAt" TYPE timestamptz(3)
	`);
    db.raw(`
	  ALTER TABLE forms 
	  ALTER COLUMN "updatedAt" TYPE timestamptz(3), ALTER COLUMN "createdAt" TYPE timestamptz(3), ALTER COLUMN "deletedAt" TYPE timestamptz(3)
	`);
    db.raw(`
	  ALTER TABLE keys 
	  ALTER COLUMN "createdAt" TYPE timestamptz(3)
	`);
    db.raw(`
	  ALTER TABLE knex_migrations 
	  ALTER COLUMN "migration_time" TYPE timestamptz(3)
	`);
    db.raw(`
	  ALTER TABLE projects 
	  ALTER COLUMN "updatedAt" TYPE timestamptz(3), ALTER COLUMN "createdAt" TYPE timestamptz(3), ALTER COLUMN "deletedAt" TYPE timestamptz(3)
	`);
    db.raw(`
	  ALTER TABLE roles 
	  ALTER COLUMN "updatedAt" TYPE timestamptz(3), ALTER COLUMN "createdAt" TYPE timestamptz(3)
	`);
    db.raw(`
	  ALTER TABLE sessions 
	  ALTER COLUMN "createdAt" TYPE timestamptz(3), ALTER COLUMN "expiresAt" TYPE timestamptz(3)
	`);
    db.raw(`
	  ALTER TABLE submission_defs 
	  ALTER COLUMN "createdAt" TYPE timestamptz(3)
	`);
    db.raw(`
	  ALTER TABLE submissions 
	  ALTER COLUMN "deletedAt" TYPE timestamptz(3), ALTER COLUMN "createdAt" TYPE timestamptz(3), ALTER COLUMN "updatedAt" TYPE timestamptz(3)
	`);
  },
};