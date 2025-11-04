/*
  Warnings:

  - You are about to drop the `VerificationSession` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."VerificationSession" DROP CONSTRAINT "VerificationSession_userId_fkey";

-- DropIndex
DROP INDEX "public"."VerificationCode_userId_purpose_idx";

-- DropTable
DROP TABLE "public"."VerificationSession";

-- CreateIndex
CREATE INDEX "VerificationCode_userId_purpose_consumedAt_expiresAt_create_idx" ON "VerificationCode"("userId", "purpose", "consumedAt", "expiresAt", "createdAt");
