/*
  Warnings:

  - A unique constraint covering the columns `[examId,number,tpLingua]` on the table `Question` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `day` on the `Exam` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `Exam` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "Question_examId_number_key";

-- AlterTable
ALTER TABLE "Exam" DROP COLUMN "day",
ADD COLUMN     "day" "ExamDay" NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "ApplicationType" NOT NULL;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "tpLingua" INTEGER NOT NULL DEFAULT -1;

-- DropEnum
DROP TYPE "ExamType";

-- CreateIndex
CREATE UNIQUE INDEX "Exam_year_day_type_key" ON "Exam"("year", "day", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Question_examId_number_tpLingua_key" ON "Question"("examId", "number", "tpLingua");
