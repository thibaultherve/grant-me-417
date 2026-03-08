-- AlterEnum: Add weather_recovery_work to industry_type
ALTER TYPE "industry_type" ADD VALUE 'weather_recovery_work' AFTER 'bushfire_recovery_work';

-- AlterTable: Backfill NULL is_eligible, make NOT NULL, add eligibility_mode
UPDATE "employers" SET "is_eligible" = true WHERE "is_eligible" IS NULL;
ALTER TABLE "employers" ALTER COLUMN "is_eligible" SET NOT NULL;
ALTER TABLE "employers" ADD COLUMN "eligibility_mode" VARCHAR NOT NULL DEFAULT 'automatic';
