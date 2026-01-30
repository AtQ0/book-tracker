-- AlterEnum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'VerificationPurpose'
      AND e.enumlabel = 'SIGNUP_SET_PASSWORD'
  ) THEN
    ALTER TYPE "VerificationPurpose" ADD VALUE 'SIGNUP_SET_PASSWORD';
  END IF;
END
$$;

-- AlterTable
ALTER TABLE "UserBook" ALTER COLUMN "status" DROP NOT NULL;
