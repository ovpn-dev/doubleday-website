-- CreateEnum
CREATE TYPE "GapClientStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'ACKNOWLEDGED');

-- AlterTable
ALTER TABLE "GapAssessmentAnswer"
  ADD COLUMN "clientStatus" "GapClientStatus" NOT NULL DEFAULT 'NOT_STARTED';
