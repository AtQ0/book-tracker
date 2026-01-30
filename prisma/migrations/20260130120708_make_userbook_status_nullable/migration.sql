-- AlterEnum
ALTER TYPE "VerificationPurpose" ADD VALUE 'SIGNUP_SET_PASSWORD';

-- AlterTable
ALTER TABLE "UserBook" ALTER COLUMN "status" DROP NOT NULL;
