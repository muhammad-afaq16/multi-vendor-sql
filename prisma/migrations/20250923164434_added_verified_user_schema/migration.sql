/*
  Warnings:

  - Made the column `country` on table `addresses` required. This step will fail if there are existing NULL values in that column.
  - Made the column `city` on table `addresses` required. This step will fail if there are existing NULL values in that column.
  - Made the column `zipCode` on table `addresses` required. This step will fail if there are existing NULL values in that column.
  - Made the column `addressType` on table `addresses` required. This step will fail if there are existing NULL values in that column.
  - Made the column `state` on table `addresses` required. This step will fail if there are existing NULL values in that column.
  - Made the column `street` on table `addresses` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."addresses" ALTER COLUMN "country" SET NOT NULL,
ALTER COLUMN "city" SET NOT NULL,
ALTER COLUMN "zipCode" SET NOT NULL,
ALTER COLUMN "addressType" SET NOT NULL,
ALTER COLUMN "state" SET NOT NULL,
ALTER COLUMN "street" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;
