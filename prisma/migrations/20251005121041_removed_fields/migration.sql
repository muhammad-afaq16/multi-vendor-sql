/*
  Warnings:

  - You are about to drop the column `resetPasswordTime` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `resetPasswordToken` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "resetPasswordTime",
DROP COLUMN "resetPasswordToken";
