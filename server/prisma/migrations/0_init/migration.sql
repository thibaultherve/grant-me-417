-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "industry_type" AS ENUM ('plant_and_animal_cultivation', 'fishing_and_pearling', 'tree_farming_and_felling', 'mining', 'construction', 'hospitality_and_tourism', 'bushfire_recovery_work', 'critical_covid19_work', 'other');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(100),
    "last_name" VARCHAR(100),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "nationality" VARCHAR(2),
    "date_of_birth" DATE,
    "uk_citizen_exemption" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_visas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "visa_type" VARCHAR NOT NULL,
    "arrival_date" DATE NOT NULL,
    "days_required" INTEGER NOT NULL DEFAULT 0,
    "eligible_days" DECIMAL DEFAULT 0,
    "days_worked" DECIMAL DEFAULT 0,
    "progress_percentage" DECIMAL,
    "is_eligible" BOOLEAN,
    "days_remaining" DECIMAL,
    "expiry_date" DATE,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_visas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visa_weekly_progress" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_visa_id" UUID NOT NULL,
    "week_start_date" DATE NOT NULL,
    "week_end_date" DATE NOT NULL,
    "hours" DECIMAL NOT NULL DEFAULT 0,
    "eligible_hours" DECIMAL NOT NULL DEFAULT 0,
    "eligible_days" INTEGER NOT NULL DEFAULT 0,
    "days_worked" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visa_weekly_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "industry" "industry_type" NOT NULL,
    "is_eligible" BOOLEAN DEFAULT true,
    "suburb_id" INTEGER,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_entries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "employer_id" UUID NOT NULL,
    "work_date" DATE NOT NULL,
    "hours" DECIMAL NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "postcodes" (
    "postcode" VARCHAR NOT NULL,
    "is_remote_very_remote" BOOLEAN DEFAULT false,
    "is_northern_australia" BOOLEAN DEFAULT false,
    "is_regional_australia" BOOLEAN DEFAULT false,
    "is_bushfire_declared" BOOLEAN DEFAULT false,
    "is_natural_disaster_declared" BOOLEAN DEFAULT false,
    "last_updated" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "last_scraped" TIMESTAMPTZ,

    CONSTRAINT "postcodes_pkey" PRIMARY KEY ("postcode")
);

-- CreateTable
CREATE TABLE "suburbs" (
    "id" SERIAL NOT NULL,
    "suburb_name" VARCHAR NOT NULL,
    "postcode" VARCHAR NOT NULL,
    "state_code" VARCHAR NOT NULL,

    CONSTRAINT "suburbs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scrape_runs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "run_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "total_postcodes" INTEGER,
    "changes_detected" INTEGER DEFAULT 0,
    "postcodes_affected" INTEGER DEFAULT 0,
    "status" VARCHAR DEFAULT 'success',
    "notes" TEXT,
    "page_modified_date" DATE,

    CONSTRAINT "scrape_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "changelogs" (
    "id" SERIAL NOT NULL,
    "scrape_run_id" UUID NOT NULL,
    "changelog_date" DATE NOT NULL,
    "title" VARCHAR NOT NULL,
    "content_markdown" TEXT NOT NULL,
    "summary" JSONB,
    "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "changelogs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_refresh_tokens_user_id" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "idx_refresh_tokens_expires_at" ON "refresh_tokens"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_profiles_user_id" ON "user_profiles"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_profiles_nationality" ON "user_profiles"("nationality");

-- CreateIndex
CREATE UNIQUE INDEX "unique_user_visa_type" ON "user_visas"("user_id", "visa_type");

-- CreateIndex
CREATE INDEX "idx_visa_weekly_progress_visa_id" ON "visa_weekly_progress"("user_visa_id");

-- CreateIndex
CREATE INDEX "idx_visa_weekly_progress_week_start" ON "visa_weekly_progress"("week_start_date");

-- CreateIndex
CREATE UNIQUE INDEX "unique_visa_week" ON "visa_weekly_progress"("user_visa_id", "week_start_date");

-- CreateIndex
CREATE INDEX "idx_employers_user_id" ON "employers"("user_id");

-- CreateIndex
CREATE INDEX "idx_employers_suburb_id" ON "employers"("suburb_id");

-- CreateIndex
CREATE INDEX "idx_work_entries_user_id" ON "work_entries"("user_id");

-- CreateIndex
CREATE INDEX "idx_work_entries_employer_id" ON "work_entries"("employer_id");

-- CreateIndex
CREATE INDEX "idx_work_entries_work_date" ON "work_entries"("work_date");

-- CreateIndex
CREATE INDEX "idx_work_entries_user_date" ON "work_entries"("user_id", "work_date");

-- CreateIndex
CREATE UNIQUE INDEX "work_entries_user_id_employer_id_work_date_key" ON "work_entries"("user_id", "employer_id", "work_date");

-- CreateIndex
CREATE INDEX "idx_suburbs_postcode" ON "suburbs"("postcode");

-- CreateIndex
CREATE INDEX "idx_suburbs_name" ON "suburbs"("suburb_name");

-- CreateIndex
CREATE INDEX "idx_suburbs_state" ON "suburbs"("state_code");

-- CreateIndex
CREATE INDEX "idx_suburbs_postcode_name" ON "suburbs"("postcode", "suburb_name");

-- CreateIndex
CREATE UNIQUE INDEX "unique_suburb_postcode" ON "suburbs"("suburb_name", "postcode");

-- CreateIndex
CREATE INDEX "idx_scrape_runs_date" ON "scrape_runs"("run_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "changelogs_scrape_run_id_key" ON "changelogs"("scrape_run_id");

-- CreateIndex
CREATE INDEX "idx_changelogs_run" ON "changelogs"("scrape_run_id");

-- CreateIndex
CREATE INDEX "idx_changelogs_date" ON "changelogs"("changelog_date" DESC);

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_visas" ADD CONSTRAINT "user_visas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visa_weekly_progress" ADD CONSTRAINT "visa_weekly_progress_user_visa_id_fkey" FOREIGN KEY ("user_visa_id") REFERENCES "user_visas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employers" ADD CONSTRAINT "employers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employers" ADD CONSTRAINT "employers_suburb_id_fkey" FOREIGN KEY ("suburb_id") REFERENCES "suburbs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_entries" ADD CONSTRAINT "work_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_entries" ADD CONSTRAINT "work_entries_employer_id_fkey" FOREIGN KEY ("employer_id") REFERENCES "employers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suburbs" ADD CONSTRAINT "suburbs_postcode_fkey" FOREIGN KEY ("postcode") REFERENCES "postcodes"("postcode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "changelogs" ADD CONSTRAINT "changelogs_scrape_run_id_fkey" FOREIGN KEY ("scrape_run_id") REFERENCES "scrape_runs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

