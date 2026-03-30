-- Phase 1: Restructure Postcode Eligibility Schema
-- Moves eligibility flags from postcodes to postcode_eligibility (per visa type)
-- Adds event-sourcing history table
-- Updates scrape_runs with visa type tracking
-- Removes changelogs table (replaced by history)

-- Step 1: Create postcode_eligibility table
CREATE TABLE "postcode_eligibility" (
  "postcode"                    VARCHAR(4) NOT NULL,
  "visa_type"                   VARCHAR(3) NOT NULL,
  "is_remote_very_remote"       BOOLEAN NOT NULL DEFAULT false,
  "is_northern_australia"       BOOLEAN NOT NULL DEFAULT false,
  "is_regional_australia"       BOOLEAN NOT NULL DEFAULT false,
  "is_bushfire_declared"        BOOLEAN NOT NULL DEFAULT false,
  "is_natural_disaster_declared" BOOLEAN NOT NULL DEFAULT false,
  "last_scraped"                TIMESTAMPTZ,

  CONSTRAINT "postcode_eligibility_pkey" PRIMARY KEY ("postcode", "visa_type"),
  CONSTRAINT "postcode_eligibility_postcode_fkey" FOREIGN KEY ("postcode") REFERENCES "postcodes"("postcode") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "idx_eligibility_visa" ON "postcode_eligibility"("visa_type");

-- Step 2: Migrate existing flags as visa 417 data
INSERT INTO "postcode_eligibility" (
  "postcode", "visa_type",
  "is_remote_very_remote", "is_northern_australia", "is_regional_australia",
  "is_bushfire_declared", "is_natural_disaster_declared", "last_scraped"
)
SELECT
  "postcode", '417',
  COALESCE("is_remote_very_remote", false),
  COALESCE("is_northern_australia", false),
  COALESCE("is_regional_australia", false),
  COALESCE("is_bushfire_declared", false),
  COALESCE("is_natural_disaster_declared", false),
  "last_scraped"
FROM "postcodes";

-- Also create 462 rows (all false initially, scraper will populate)
INSERT INTO "postcode_eligibility" ("postcode", "visa_type")
SELECT "postcode", '462' FROM "postcodes";

-- Step 3: Remove eligibility flags and last_scraped from postcodes table
ALTER TABLE "postcodes" DROP COLUMN "is_remote_very_remote";
ALTER TABLE "postcodes" DROP COLUMN "is_northern_australia";
ALTER TABLE "postcodes" DROP COLUMN "is_regional_australia";
ALTER TABLE "postcodes" DROP COLUMN "is_bushfire_declared";
ALTER TABLE "postcodes" DROP COLUMN "is_natural_disaster_declared";
ALTER TABLE "postcodes" DROP COLUMN "last_scraped";

-- Step 4: Create postcode_eligibility_history table
CREATE TABLE "postcode_eligibility_history" (
  "id"              UUID NOT NULL DEFAULT gen_random_uuid(),
  "postcode"        VARCHAR(4) NOT NULL,
  "visa_type"       VARCHAR(3) NOT NULL,
  "category"        TEXT NOT NULL,
  "old_value"       BOOLEAN NOT NULL,
  "new_value"       BOOLEAN NOT NULL,
  "effective_date"  DATE NOT NULL,
  "detected_at"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "scrape_run_id"   UUID,
  "source_url"      TEXT NOT NULL,
  "source_type"     TEXT NOT NULL DEFAULT 'live',

  CONSTRAINT "postcode_eligibility_history_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "postcode_eligibility_history_postcode_fkey" FOREIGN KEY ("postcode") REFERENCES "postcodes"("postcode") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "postcode_eligibility_history_scrape_run_id_fkey" FOREIGN KEY ("scrape_run_id") REFERENCES "scrape_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "idx_history_point_in_time" ON "postcode_eligibility_history"("postcode", "visa_type", "category", "effective_date" DESC);
CREATE INDEX "idx_history_scrape_run" ON "postcode_eligibility_history"("scrape_run_id");
CREATE INDEX "idx_history_effective_date" ON "postcode_eligibility_history"("effective_date" DESC);

-- Step 5: Update scrape_runs table
ALTER TABLE "scrape_runs" ADD COLUMN "visa_type" VARCHAR(3);
ALTER TABLE "scrape_runs" ADD COLUMN "source_url" TEXT;
ALTER TABLE "scrape_runs" ADD COLUMN "source_type" TEXT NOT NULL DEFAULT 'live';

-- Step 6: Drop changelogs table
DROP TABLE IF EXISTS "changelogs";
