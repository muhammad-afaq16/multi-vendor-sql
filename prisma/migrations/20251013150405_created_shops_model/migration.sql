-- CreateEnum
CREATE TYPE "public"."ShopRole" AS ENUM ('SELLER');

-- CreateTable
CREATE TABLE "public"."shops" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "avatar" TEXT,
    "role" "public"."ShopRole" NOT NULL DEFAULT 'SELLER',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "refresh_token" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shops_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shops_email_key" ON "public"."shops"("email");
