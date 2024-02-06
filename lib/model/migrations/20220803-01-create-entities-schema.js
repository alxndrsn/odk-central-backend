// Copyright 2024 ODK Central Developers
// See the NOTICE file at the top-level directory of this distribution and at
// https://github.com/getodk/central-backend/blob/master/NOTICE.
// This file is part of ODK Central. It is subject to the license terms in
// the LICENSE file found in the top-level directory of this distribution and at
// https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
// including this file, may be copied, modified, propagated, or distributed
// except according to the terms contained in the LICENSE file.

module.exports = {
  up: async (db) => {
    db.raw(`create table "datasets" ("id" serial primary key, "name" text not null, "acteeId" varchar(36) not null, "createdAt" timestamptz, "projectId" integer not null, "revisionNumber" integer not null default '0')`);
    db.raw(`alter table "datasets" add constraint "datasets_projectid_foreign" foreign key ("projectId") references "projects" ("id")`);
    db.raw(`alter table "datasets" add constraint "datasets_name_projectid_unique" unique ("name", "projectId")`);
    db.raw(`create table "ds_properties" ("id" serial primary key, "name" text not null, "datasetId" integer not null)`);
    db.raw(`alter table "ds_properties" add constraint "ds_properties_datasetid_foreign" foreign key ("datasetId") references "datasets" ("id")`);
    db.raw(`alter table "ds_properties" add constraint "ds_properties_name_datasetid_unique" unique ("name", "datasetId")`);
    db.raw(`create table "ds_property_fields" ("dsPropertyId" integer, "formDefId" integer, "path" text)`);
    db.raw(`alter table "ds_property_fields" add constraint "ds_property_fields_dspropertyid_foreign" foreign key ("dsPropertyId") references "ds_properties" ("id")`);
    db.raw(`alter table "ds_property_fields" add constraint "ds_property_fields_formdefid_path_foreign" foreign key ("formDefId", "path") references "form_fields" ("formDefId", "path") on delete cascade`);
    db.raw(`alter table "ds_property_fields" add constraint "ds_property_fields_dspropertyid_formdefid_path_unique" unique ("dsPropertyId", "formDefId", "path")`);
    db.raw(`create table "entities" ("id" serial primary key, "uuid" varchar(255) not null, "datasetId" integer, "label" text not null, "createdAt" timestamptz, "createdBy" integer not null, "updatedAt" timestamptz)`);
    db.raw(`alter table "entities" add constraint "entities_datasetid_foreign" foreign key ("datasetId") references "datasets" ("id")`);
    db.raw(`alter table "entities" add constraint "entities_createdby_foreign" foreign key ("createdBy") references "actors" ("id")`);
    db.raw(`alter table "entities" add constraint "entities_uuid_unique" unique ("uuid")`);
    db.raw(`create table "entity_defs" ("id" serial primary key, "entityId" integer not null, "createdAt" timestamptz, "current" boolean, "submissionDefId" integer not null, "data" jsonb)`);
    db.raw(`alter table "entity_defs" add constraint "entity_defs_entityid_foreign" foreign key ("entityId") references "entities" ("id")`);
    db.raw(`alter table "entity_defs" add constraint "entity_defs_submissiondefid_foreign" foreign key ("submissionDefId") references "submission_defs" ("id")`);
    db.raw(`create table "dataset_form_defs" ("datasetId" integer not null, "formDefId" integer not null)`);
    db.raw(`alter table "dataset_form_defs" add constraint "dataset_form_defs_datasetid_foreign" foreign key ("datasetId") references "datasets" ("id")`);
    db.raw(`alter table "dataset_form_defs" add constraint "dataset_form_defs_formdefid_foreign" foreign key ("formDefId") references "form_defs" ("id") on delete cascade`);
    db.raw(`alter table "dataset_form_defs" add constraint "dataset_form_defs_datasetid_formdefid_unique" unique ("datasetId", "formDefId")`);
    db.raw(`alter table "form_attachments" add column "datasetId" integer`);
    db.raw(`alter table "form_attachments" add constraint "form_attachments_datasetid_foreign" foreign key ("datasetId") references "datasets" ("id")`);
    db.raw(`ALTER TABLE form_attachments
            ADD CONSTRAINT "check_blobId_or_datasetId_is_null"
            CHECK (("blobId" IS NULL) OR ("datasetId" IS NULL));`);
  },
};
