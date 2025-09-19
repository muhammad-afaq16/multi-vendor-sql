/*
  Warnings:

  - You are about to drop the column `address1` on the `addresses` table. All the data in the column will be lost.
  - You are about to drop the column `address2` on the `addresses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."addresses" DROP COLUMN "address1",
DROP COLUMN "address2",
ADD COLUMN     "state" TEXT,
ADD COLUMN     "street" TEXT;
