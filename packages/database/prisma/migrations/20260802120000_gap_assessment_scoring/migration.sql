-- AlterTable
ALTER TABLE "StandardClause"
  ADD COLUMN "parentId" TEXT,
  ADD COLUMN "assessmentQuestion" TEXT,
  ADD COLUMN "requiredDocuments" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "highRisk" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "GapAssessment"
  ADD COLUMN "readinessLabel" TEXT,
  ADD COLUMN "requiredDocumentGaps" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "highRiskGaps" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE INDEX "StandardClause_parentId_idx" ON "StandardClause"("parentId");

-- AddForeignKey
ALTER TABLE "StandardClause" ADD CONSTRAINT "StandardClause_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "StandardClause"("id") ON DELETE CASCADE ON UPDATE CASCADE;
