/*
  Warnings:

  - You are about to drop the `Attempt` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "AttemptSessionType" AS ENUM ('AVULSO', 'SIMULATION', 'EXAM');

-- CreateEnum
CREATE TYPE "AttemptSessionStatus" AS ENUM ('IN_PROGRESS', 'CORRECTED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "AttemptCorrectionStatus" AS ENUM ('PENDING', 'CORRECT', 'WRONG', 'SKIPPED', 'MISSING_ANSWER_KEY', 'ANNULLED');

-- DropForeignKey
ALTER TABLE "Attempt" DROP CONSTRAINT "Attempt_questionId_fkey";

-- DropForeignKey
ALTER TABLE "Attempt" DROP CONSTRAINT "Attempt_simulationId_fkey";

-- DropForeignKey
ALTER TABLE "Attempt" DROP CONSTRAINT "Attempt_userId_fkey";

-- DropTable
DROP TABLE "Attempt";

-- CreateTable
CREATE TABLE "AttemptSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "AttemptSessionType" NOT NULL,
    "status" "AttemptSessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "simulationId" TEXT,
    "examId" TEXT,
    "title" TEXT,
    "metadata" JSONB,
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "answeredQuestions" INTEGER NOT NULL DEFAULT 0,
    "correctQuestions" INTEGER NOT NULL DEFAULT 0,
    "wrongQuestions" INTEGER NOT NULL DEFAULT 0,
    "skippedQuestions" INTEGER NOT NULL DEFAULT 0,
    "rawScore" DECIMAL(10,2),
    "triScore" DECIMAL(10,2),
    "scoreMethod" TEXT DEFAULT 'SIMPLE',
    "totalTimeSpentMs" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "correctedAt" TIMESTAMP(3),
    "abandonedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttemptSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttemptAnswer" (
    "id" TEXT NOT NULL,
    "attemptSessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedAlternativeId" TEXT,
    "selectedLetter" VARCHAR(5),
    "correctLetter" VARCHAR(10),
    "isCorrect" BOOLEAN,
    "correctionStatus" "AttemptCorrectionStatus" NOT NULL DEFAULT 'PENDING',
    "isSkipped" BOOLEAN NOT NULL DEFAULT false,
    "timeSpentMs" INTEGER NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "confidenceLevel" INTEGER,
    "questionOrder" INTEGER,
    "answeredAt" TIMESTAMP(3),
    "correctedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttemptAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AttemptSession_userId_idx" ON "AttemptSession"("userId");

-- CreateIndex
CREATE INDEX "AttemptSession_type_idx" ON "AttemptSession"("type");

-- CreateIndex
CREATE INDEX "AttemptSession_status_idx" ON "AttemptSession"("status");

-- CreateIndex
CREATE INDEX "AttemptSession_simulationId_idx" ON "AttemptSession"("simulationId");

-- CreateIndex
CREATE INDEX "AttemptSession_examId_idx" ON "AttemptSession"("examId");

-- CreateIndex
CREATE INDEX "AttemptSession_startedAt_idx" ON "AttemptSession"("startedAt");

-- CreateIndex
CREATE INDEX "AttemptSession_correctedAt_idx" ON "AttemptSession"("correctedAt");

-- CreateIndex
CREATE INDEX "AttemptAnswer_attemptSessionId_idx" ON "AttemptAnswer"("attemptSessionId");

-- CreateIndex
CREATE INDEX "AttemptAnswer_questionId_idx" ON "AttemptAnswer"("questionId");

-- CreateIndex
CREATE INDEX "AttemptAnswer_selectedAlternativeId_idx" ON "AttemptAnswer"("selectedAlternativeId");

-- CreateIndex
CREATE INDEX "AttemptAnswer_isCorrect_idx" ON "AttemptAnswer"("isCorrect");

-- CreateIndex
CREATE INDEX "AttemptAnswer_correctionStatus_idx" ON "AttemptAnswer"("correctionStatus");

-- CreateIndex
CREATE INDEX "AttemptAnswer_questionOrder_idx" ON "AttemptAnswer"("questionOrder");

-- CreateIndex
CREATE UNIQUE INDEX "AttemptAnswer_attemptSessionId_questionId_key" ON "AttemptAnswer"("attemptSessionId", "questionId");

-- AddForeignKey
ALTER TABLE "AttemptSession" ADD CONSTRAINT "AttemptSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttemptSession" ADD CONSTRAINT "AttemptSession_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "Simulation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttemptSession" ADD CONSTRAINT "AttemptSession_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttemptAnswer" ADD CONSTRAINT "AttemptAnswer_attemptSessionId_fkey" FOREIGN KEY ("attemptSessionId") REFERENCES "AttemptSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttemptAnswer" ADD CONSTRAINT "AttemptAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttemptAnswer" ADD CONSTRAINT "AttemptAnswer_selectedAlternativeId_fkey" FOREIGN KEY ("selectedAlternativeId") REFERENCES "Alternative"("id") ON DELETE SET NULL ON UPDATE CASCADE;
