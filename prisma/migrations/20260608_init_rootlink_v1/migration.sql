-- CreateEnum
CREATE TYPE "FamilyRole" AS ENUM ('OWNER', 'ADMIN', 'EDITOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "RelationshipType" AS ENUM ('PARENT_OF', 'SPOUSE_OF', 'SIBLING_OF');

-- CreateEnum
CREATE TYPE "DataSource" AS ENUM ('SELF_REPORTED', 'PROXY_RECORDED', 'INTERVIEW', 'FAMILY_MEMORY', 'IMPORTED', 'ADMIN_CREATED');

-- CreateEnum
CREATE TYPE "MaintenanceRole" AS ENUM ('SELF', 'PROXY', 'GUARDIAN', 'FAMILY_ADMIN', 'ARCHIVIST');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('FAMILY', 'ADMINS_ONLY', 'PRIVATE_TO_MAINTAINERS');

-- CreateTable
CREATE TABLE "app_user" (
    "id" UUID NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "display_name" VARCHAR(120) NOT NULL,
    "family_id" UUID,
    "family_role" "FamilyRole" NOT NULL DEFAULT 'VIEWER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "app_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "family" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(80) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "created_by_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "family_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member" (
    "id" UUID NOT NULL,
    "family_id" UUID NOT NULL,
    "claimed_by_user_id" UUID,
    "full_name" VARCHAR(120) NOT NULL,
    "gender" "Gender",
    "birth_date" DATE,
    "death_date" DATE,
    "avatar_url" TEXT,
    "bio_short" TEXT,
    "maintenance_role" "MaintenanceRole" NOT NULL DEFAULT 'PROXY',
    "source" "DataSource" NOT NULL DEFAULT 'ADMIN_CREATED',
    "created_by_id" UUID,
    "updated_by_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "member_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "member_birth_before_death_chk" CHECK (
        "birth_date" IS NULL
        OR "death_date" IS NULL
        OR "birth_date" <= "death_date"
    )
);

-- CreateTable
CREATE TABLE "biography" (
    "id" UUID NOT NULL,
    "family_id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "content_md" TEXT NOT NULL DEFAULT '',
    "source" "DataSource" NOT NULL DEFAULT 'ADMIN_CREATED',
    "maintenance_role" "MaintenanceRole" NOT NULL DEFAULT 'PROXY',
    "visibility" "Visibility" NOT NULL DEFAULT 'FAMILY',
    "created_by_id" UUID,
    "updated_by_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "biography_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timeline_event" (
    "id" UUID NOT NULL,
    "family_id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "description" TEXT,
    "event_date" DATE,
    "sort_date" DATE NOT NULL,
    "date_label" VARCHAR(80),
    "is_approximate" BOOLEAN NOT NULL DEFAULT false,
    "source" "DataSource" NOT NULL DEFAULT 'ADMIN_CREATED',
    "maintenance_role" "MaintenanceRole" NOT NULL DEFAULT 'PROXY',
    "visibility" "Visibility" NOT NULL DEFAULT 'FAMILY',
    "created_by_id" UUID,
    "updated_by_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "timeline_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relationship" (
    "id" UUID NOT NULL,
    "family_id" UUID NOT NULL,
    "subject_member_id" UUID NOT NULL,
    "object_member_id" UUID NOT NULL,
    "relationship_type" "RelationshipType" NOT NULL,
    "start_date" DATE,
    "end_date" DATE,
    "is_primary" BOOLEAN NOT NULL DEFAULT true,
    "source" "DataSource" NOT NULL DEFAULT 'ADMIN_CREATED',
    "created_by_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "relationship_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "relationship_not_self_chk" CHECK ("subject_member_id" <> "object_member_id"),
    CONSTRAINT "relationship_date_range_chk" CHECK (
        "start_date" IS NULL
        OR "end_date" IS NULL
        OR "start_date" <= "end_date"
    )
);

-- CreateIndex
CREATE UNIQUE INDEX "app_user_email_key" ON "app_user"("email");

-- CreateIndex
CREATE INDEX "app_user_family_id_idx" ON "app_user"("family_id");

-- CreateIndex
CREATE UNIQUE INDEX "family_slug_key" ON "family"("slug");

-- CreateIndex
CREATE INDEX "family_created_by_id_idx" ON "family"("created_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "member_claimed_by_user_id_key" ON "member"("claimed_by_user_id");

-- CreateIndex
CREATE INDEX "member_family_id_idx" ON "member"("family_id");

-- CreateIndex
CREATE INDEX "member_family_full_name_idx" ON "member"("family_id", "full_name");

-- CreateIndex
CREATE INDEX "member_family_birth_date_idx" ON "member"("family_id", "birth_date");

-- CreateIndex
CREATE UNIQUE INDEX "biography_member_id_key" ON "biography"("member_id");

-- CreateIndex
CREATE INDEX "biography_family_id_idx" ON "biography"("family_id");

-- CreateIndex
CREATE INDEX "timeline_event_family_sort_date_idx" ON "timeline_event"("family_id", "sort_date");

-- CreateIndex
CREATE INDEX "timeline_event_family_member_sort_idx" ON "timeline_event"("family_id", "member_id", "sort_date");

-- CreateIndex
CREATE UNIQUE INDEX "relationship_family_type_subject_object_key" ON "relationship"("family_id", "relationship_type", "subject_member_id", "object_member_id");

-- CreateIndex
CREATE INDEX "relationship_family_subject_idx" ON "relationship"("family_id", "subject_member_id");

-- CreateIndex
CREATE INDEX "relationship_family_object_idx" ON "relationship"("family_id", "object_member_id");

-- CreateIndex
CREATE INDEX "relationship_family_type_idx" ON "relationship"("family_id", "relationship_type");

-- AddForeignKey
ALTER TABLE "app_user" ADD CONSTRAINT "app_user_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "family"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family" ADD CONSTRAINT "family_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "app_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_claimed_by_user_id_fkey" FOREIGN KEY ("claimed_by_user_id") REFERENCES "app_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "app_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "app_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "biography" ADD CONSTRAINT "biography_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "biography" ADD CONSTRAINT "biography_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "biography" ADD CONSTRAINT "biography_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "app_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "biography" ADD CONSTRAINT "biography_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "app_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_event" ADD CONSTRAINT "timeline_event_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_event" ADD CONSTRAINT "timeline_event_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_event" ADD CONSTRAINT "timeline_event_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "app_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_event" ADD CONSTRAINT "timeline_event_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "app_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relationship" ADD CONSTRAINT "relationship_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relationship" ADD CONSTRAINT "relationship_subject_member_id_fkey" FOREIGN KEY ("subject_member_id") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relationship" ADD CONSTRAINT "relationship_object_member_id_fkey" FOREIGN KEY ("object_member_id") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relationship" ADD CONSTRAINT "relationship_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "app_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
