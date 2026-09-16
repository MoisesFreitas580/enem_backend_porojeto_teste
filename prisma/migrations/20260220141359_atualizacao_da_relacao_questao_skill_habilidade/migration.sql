/*
  Warnings:

  - You are about to drop the `QuestionSkill` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "QuestionSkill" DROP CONSTRAINT "QuestionSkill_questionId_fkey";

-- DropForeignKey
ALTER TABLE "QuestionSkill" DROP CONSTRAINT "QuestionSkill_skillId_fkey";

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "skillId" TEXT;

-- DropTable
DROP TABLE "QuestionSkill";

-- CreateIndex
CREATE INDEX "Question_skillId_idx" ON "Question"("skillId");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE SET NULL ON UPDATE CASCADE;
