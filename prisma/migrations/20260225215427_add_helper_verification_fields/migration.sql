-- CreateEnum
CREATE TYPE "HelperStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "documentNumber" TEXT,
ADD COLUMN     "employmentType" TEXT,
ADD COLUMN     "helperStatus" "HelperStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
ADD COLUMN     "institution" TEXT,
ADD COLUMN     "languages" TEXT[],
ADD COLUMN     "registrationAddress" TEXT;
