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
	ALTER TABLE entity_defs
	ADD COLUMN "creatorId" integer,
	ADD COLUMN "userAgent" varchar(255)
	`);
    db.raw(`
	UPDATE entity_defs
	SET "creatorId" = entities."creatorId"
	FROM entities
	WHERE entity_defs."entityId" = entities.id;
	  `);
    db.raw(`
	UPDATE entity_defs
	SET "userAgent" = submission_defs."userAgent"
	FROM submission_defs
	WHERE entity_defs."submissionDefId" = submission_defs.id;
	  `);
    db.raw(`
	ALTER TABLE entity_defs
	ALTER COLUMN "creatorId" SET NOT NULL
	`);
  },
};