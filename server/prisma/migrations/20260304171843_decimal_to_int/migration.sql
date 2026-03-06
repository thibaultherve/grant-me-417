/*
  Warnings:

  - You are about to alter the column `eligible_days` on the `user_visas` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Integer`.
  - You are about to alter the column `days_worked` on the `user_visas` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Integer`.
  - You are about to alter the column `days_remaining` on the `user_visas` table. The data in that column could be lost. The data in that column will be cast from `Decimal` to `Integer`.
  - Made the column `eligible_days` on table `user_visas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `days_worked` on table `user_visas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `days_remaining` on table `user_visas` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "user_visas" ALTER COLUMN "eligible_days" SET NOT NULL,
ALTER COLUMN "eligible_days" SET DEFAULT 0,
ALTER COLUMN "eligible_days" SET DATA TYPE INTEGER,
ALTER COLUMN "days_worked" SET NOT NULL,
ALTER COLUMN "days_worked" SET DEFAULT 0,
ALTER COLUMN "days_worked" SET DATA TYPE INTEGER,
ALTER COLUMN "days_remaining" SET NOT NULL,
ALTER COLUMN "days_remaining" SET DEFAULT 0,
ALTER COLUMN "days_remaining" SET DATA TYPE INTEGER;
