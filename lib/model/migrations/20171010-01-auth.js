// Copyright 2024 ODK Central Developers
// See the NOTICE file at the top-level directory of this distribution and at
// https://github.com/getodk/central-backend/blob/master/NOTICE.
// This file is part of ODK Central. It is subject to the license terms in
// the LICENSE file found in the top-level directory of this distribution and at
// https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
// including this file, may be copied, modified, propagated, or distributed
// except according to the terms contained in the LICENSE file.

module.exports = {
  down: () => { throw new Error('down() not yet supported for this migration'); },
  up: (db) => {
    db.raw(`create table "actees" ("id" varchar(36), "species" varchar(36))`);
    db.raw(`create table "actors" ("id" serial primary key, "type" text check ("type" in ('system', 'user', 'group', 'proxy')) not null, "acteeId" varchar(36) not null, "displayName" varchar(64) not null, "meta" jsonb, "createdAt" timestamptz, "updatedAt" timestamptz, "deletedAt" timestamptz)`);
    db.raw(`create table "users" ("actorId" integer, "password" varchar(64), "mfaSecret" varchar(20), "email" varchar(320) not null, "updatedAt" timestamptz)`);
    db.raw(`create table "sessions" ("actorId" integer not null, "token" varchar(64) not null, "expires" timestamptz not null, "createdAt" timestamptz)`);
    db.raw(`create table "memberships" ("parentActorId" integer not null, "childActorId" integer not null, "createdAt" timestamptz, "updatedAt" timestamptz)`);
    db.raw(`create table "grants" ("actorId" integer not null, "verb" varchar(16) not null, "acteeId" varchar(36) not null, "createdAt" timestamptz)`);
    db.raw(`alter table "actees" add constraint "actees_pkey" primary key ("id")`);
    db.raw(`alter table "actors" add constraint "actors_acteeid_foreign" foreign key ("acteeId") references "actees" ("id")`);
    db.raw(`alter table "users" add constraint "users_pkey" primary key ("actorId")`);
    db.raw(`alter table "sessions" add constraint "sessions_actorid_foreign" foreign key ("actorId") references "actors" ("id")`);
    db.raw(`alter table "memberships" add constraint "memberships_pkey" primary key ("parentActorId", "childActorId")`);
    db.raw(`alter table "grants" add constraint "grants_pkey" primary key ("actorId", "verb", "acteeId")`);
    db.raw(`create index "actors_type_index" on "actors" ("type")`);
    db.raw(`alter table "users" add constraint "users_email_unique" unique ("email")`);
    db.raw(`create index "sessions_actorid_expires_index" on "sessions" ("actorId", "expires")`);
    db.raw(`alter table "memberships" add constraint "memberships_parentactorid_foreign" foreign key ("parentActorId") references "actors" ("id")`);
    db.raw(`alter table "grants" add constraint "grants_actorid_foreign" foreign key ("actorId") references "actors" ("id")`);
    db.raw(`alter table "users" add constraint "users_actorid_foreign" foreign key ("actorId") references "actors" ("id")`);
    db.raw(`alter table "memberships" add constraint "memberships_childactorid_foreign" foreign key ("childActorId") references "actors" ("id")`);
    db.raw(`alter table "grants" add constraint "grants_acteeid_foreign" foreign key ("acteeId") references "actees" ("id")`);
    db.raw(`create index "users_email_index" on "users" ("email")`);
    db.raw(`create index "grants_actorid_acteeid_index" on "grants" ("actorId", "acteeId")`);
    db.raw(`create index "grants_verb_acteeid_index" on "grants" ("verb", "acteeId")`);
  },
};
