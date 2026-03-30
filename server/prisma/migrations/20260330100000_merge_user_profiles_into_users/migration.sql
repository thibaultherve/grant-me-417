-- Merge user_profiles into users table

-- Step 1: Add profile columns to users
ALTER TABLE "users" ADD COLUMN "nationality" VARCHAR(2);
ALTER TABLE "users" ADD COLUMN "whv_type" VARCHAR(3);
ALTER TABLE "users" ADD COLUMN "uk_citizen_exemption" BOOLEAN DEFAULT false;

-- Step 2: Copy data from user_profiles to users
UPDATE "users" u
SET
  "nationality" = up."nationality",
  "whv_type" = up."whv_type",
  "uk_citizen_exemption" = up."uk_citizen_exemption"
FROM "user_profiles" up
WHERE up."user_id" = u."id";

-- Step 3: Drop user_profiles table (cascades FK constraint)
DROP TABLE "user_profiles";

-- Step 4: Add index on nationality
CREATE INDEX "idx_users_nationality" ON "users"("nationality");
