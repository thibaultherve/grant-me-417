-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN "whv_type" VARCHAR(3);

-- Backfill existing users based on nationality
-- 462 countries
UPDATE "user_profiles"
SET "whv_type" = '462'
WHERE "nationality" IN ('AR','AT','CL','CN','CZ','EC','GR','HU','ID','IL','LU','MY','PE','PL','PT','SM','SK','SI','ES','TH','TR','US','UY','VN');

-- 417 countries
UPDATE "user_profiles"
SET "whv_type" = '417'
WHERE "nationality" IN ('BE','CA','CY','DK','EE','FI','FR','DE','HK','IE','IT','JP','KR','MT','NL','NO','SE','TW','GB')
AND "whv_type" IS NULL;
