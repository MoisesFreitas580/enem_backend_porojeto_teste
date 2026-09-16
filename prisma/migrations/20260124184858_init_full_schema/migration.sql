-- CreateEnum
CREATE TYPE "ExamType" AS ENUM ('REGULAR', 'PPL');

-- CreateEnum
CREATE TYPE "AreaCode" AS ENUM ('LC', 'CH', 'CN', 'MT');

-- CreateEnum
CREATE TYPE "BlockType" AS ENUM ('TEXT', 'IMAGE');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'TEACHER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ValidationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "Area" (
    "id" TEXT NOT NULL,
    "code" "AreaCode" NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Discipline" (
    "id" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Discipline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeObject" (
    "id" TEXT NOT NULL,
    "disciplineId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeObject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Content" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ObjectContent" (
    "knowledgeObjectId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,

    CONSTRAINT "ObjectContent_pkey" PRIMARY KEY ("knowledgeObjectId","contentId")
);

-- CreateTable
CREATE TABLE "Competency" (
    "id" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Competency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "competencyId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillKnowledgeObject" (
    "skillId" TEXT NOT NULL,
    "knowledgeObjectId" TEXT NOT NULL,
    "relevance" DOUBLE PRECISION,
    "confidence" DOUBLE PRECISION,
    "source" TEXT,

    CONSTRAINT "SkillKnowledgeObject_pkey" PRIMARY KEY ("skillId","knowledgeObjectId")
);

-- CreateTable
CREATE TABLE "Exam" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "day" INTEGER NOT NULL,
    "type" "ExamType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "area" "AreaCode" NOT NULL,
    "rawJson" JSONB,
    "inepItemCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionBlock" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "type" "BlockType" NOT NULL,
    "order" INTEGER NOT NULL,
    "text" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alternative" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "letter" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alternative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionSkill" (
    "questionId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "QuestionSkill_pkey" PRIMARY KEY ("questionId","skillId")
);

-- CreateTable
CREATE TABLE "QuestionDiscipline" (
    "questionId" TEXT NOT NULL,
    "disciplineId" TEXT NOT NULL,

    CONSTRAINT "QuestionDiscipline_pkey" PRIMARY KEY ("questionId","disciplineId")
);

-- CreateTable
CREATE TABLE "QuestionKnowledgeObject" (
    "questionId" TEXT NOT NULL,
    "knowledgeObjectId" TEXT NOT NULL,

    CONSTRAINT "QuestionKnowledgeObject_pkey" PRIMARY KEY ("questionId","knowledgeObjectId")
);

-- CreateTable
CREATE TABLE "InepItemMicrodata" (
    "id" TEXT NOT NULL,
    "inepItemCode" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "numparamA" DOUBLE PRECISION,
    "numparamB" DOUBLE PRECISION,
    "numparamC" DOUBLE PRECISION,
    "extra" JSONB,
    "questionId" TEXT,

    CONSTRAINT "InepItemMicrodata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Simulation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "filters" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Simulation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimulationQuestion" (
    "simulationId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "SimulationQuestion_pkey" PRIMARY KEY ("simulationId","questionId")
);

-- CreateTable
CREATE TABLE "Attempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "simulationId" TEXT,
    "selectedAlternativeId" TEXT,
    "isCorrect" BOOLEAN,
    "timeSpentMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiClassification" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "modelVersion" TEXT,
    "confidence" DOUBLE PRECISION,
    "rationale" TEXT,
    "suggestedSkillId" TEXT,
    "suggestedDisciplineId" TEXT,
    "suggestedKnowledgeObjectId" TEXT,
    "suggestedContentId" TEXT,
    "extra" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiClassification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HumanValidation" (
    "id" TEXT NOT NULL,
    "aiClassificationId" TEXT NOT NULL,
    "validatedByUserId" TEXT NOT NULL,
    "status" "ValidationStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "validatedAt" TIMESTAMP(3),

    CONSTRAINT "HumanValidation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Area_code_key" ON "Area"("code");

-- CreateIndex
CREATE INDEX "Discipline_areaId_idx" ON "Discipline"("areaId");

-- CreateIndex
CREATE UNIQUE INDEX "Discipline_areaId_name_key" ON "Discipline"("areaId", "name");

-- CreateIndex
CREATE INDEX "KnowledgeObject_disciplineId_idx" ON "KnowledgeObject"("disciplineId");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeObject_disciplineId_name_key" ON "KnowledgeObject"("disciplineId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Content_name_key" ON "Content"("name");

-- CreateIndex
CREATE INDEX "ObjectContent_contentId_idx" ON "ObjectContent"("contentId");

-- CreateIndex
CREATE INDEX "Competency_areaId_idx" ON "Competency"("areaId");

-- CreateIndex
CREATE UNIQUE INDEX "Competency_areaId_code_key" ON "Competency"("areaId", "code");

-- CreateIndex
CREATE INDEX "Skill_competencyId_idx" ON "Skill"("competencyId");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_competencyId_code_key" ON "Skill"("competencyId", "code");

-- CreateIndex
CREATE INDEX "SkillKnowledgeObject_knowledgeObjectId_idx" ON "SkillKnowledgeObject"("knowledgeObjectId");

-- CreateIndex
CREATE INDEX "Exam_year_idx" ON "Exam"("year");

-- CreateIndex
CREATE UNIQUE INDEX "Exam_year_day_type_key" ON "Exam"("year", "day", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Question_inepItemCode_key" ON "Question"("inepItemCode");

-- CreateIndex
CREATE INDEX "Question_examId_idx" ON "Question"("examId");

-- CreateIndex
CREATE INDEX "Question_area_idx" ON "Question"("area");

-- CreateIndex
CREATE UNIQUE INDEX "Question_examId_number_key" ON "Question"("examId", "number");

-- CreateIndex
CREATE INDEX "QuestionBlock_questionId_idx" ON "QuestionBlock"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionBlock_questionId_order_key" ON "QuestionBlock"("questionId", "order");

-- CreateIndex
CREATE INDEX "Alternative_questionId_idx" ON "Alternative"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "Alternative_questionId_letter_key" ON "Alternative"("questionId", "letter");

-- CreateIndex
CREATE INDEX "QuestionSkill_skillId_idx" ON "QuestionSkill"("skillId");

-- CreateIndex
CREATE INDEX "QuestionDiscipline_disciplineId_idx" ON "QuestionDiscipline"("disciplineId");

-- CreateIndex
CREATE INDEX "QuestionKnowledgeObject_knowledgeObjectId_idx" ON "QuestionKnowledgeObject"("knowledgeObjectId");

-- CreateIndex
CREATE UNIQUE INDEX "InepItemMicrodata_inepItemCode_key" ON "InepItemMicrodata"("inepItemCode");

-- CreateIndex
CREATE UNIQUE INDEX "InepItemMicrodata_questionId_key" ON "InepItemMicrodata"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SimulationQuestion_simulationId_order_key" ON "SimulationQuestion"("simulationId", "order");

-- CreateIndex
CREATE INDEX "Attempt_userId_idx" ON "Attempt"("userId");

-- CreateIndex
CREATE INDEX "Attempt_questionId_idx" ON "Attempt"("questionId");

-- CreateIndex
CREATE INDEX "AiClassification_questionId_idx" ON "AiClassification"("questionId");

-- CreateIndex
CREATE INDEX "HumanValidation_status_idx" ON "HumanValidation"("status");

-- AddForeignKey
ALTER TABLE "Discipline" ADD CONSTRAINT "Discipline_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeObject" ADD CONSTRAINT "KnowledgeObject_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObjectContent" ADD CONSTRAINT "ObjectContent_knowledgeObjectId_fkey" FOREIGN KEY ("knowledgeObjectId") REFERENCES "KnowledgeObject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObjectContent" ADD CONSTRAINT "ObjectContent_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competency" ADD CONSTRAINT "Competency_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "Competency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillKnowledgeObject" ADD CONSTRAINT "SkillKnowledgeObject_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillKnowledgeObject" ADD CONSTRAINT "SkillKnowledgeObject_knowledgeObjectId_fkey" FOREIGN KEY ("knowledgeObjectId") REFERENCES "KnowledgeObject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionBlock" ADD CONSTRAINT "QuestionBlock_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alternative" ADD CONSTRAINT "Alternative_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionSkill" ADD CONSTRAINT "QuestionSkill_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionSkill" ADD CONSTRAINT "QuestionSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionDiscipline" ADD CONSTRAINT "QuestionDiscipline_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionDiscipline" ADD CONSTRAINT "QuestionDiscipline_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionKnowledgeObject" ADD CONSTRAINT "QuestionKnowledgeObject_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionKnowledgeObject" ADD CONSTRAINT "QuestionKnowledgeObject_knowledgeObjectId_fkey" FOREIGN KEY ("knowledgeObjectId") REFERENCES "KnowledgeObject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InepItemMicrodata" ADD CONSTRAINT "InepItemMicrodata_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Simulation" ADD CONSTRAINT "Simulation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulationQuestion" ADD CONSTRAINT "SimulationQuestion_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "Simulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulationQuestion" ADD CONSTRAINT "SimulationQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "Simulation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiClassification" ADD CONSTRAINT "AiClassification_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiClassification" ADD CONSTRAINT "AiClassification_suggestedSkillId_fkey" FOREIGN KEY ("suggestedSkillId") REFERENCES "Skill"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiClassification" ADD CONSTRAINT "AiClassification_suggestedDisciplineId_fkey" FOREIGN KEY ("suggestedDisciplineId") REFERENCES "Discipline"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiClassification" ADD CONSTRAINT "AiClassification_suggestedKnowledgeObjectId_fkey" FOREIGN KEY ("suggestedKnowledgeObjectId") REFERENCES "KnowledgeObject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiClassification" ADD CONSTRAINT "AiClassification_suggestedContentId_fkey" FOREIGN KEY ("suggestedContentId") REFERENCES "Content"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HumanValidation" ADD CONSTRAINT "HumanValidation_aiClassificationId_fkey" FOREIGN KEY ("aiClassificationId") REFERENCES "AiClassification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HumanValidation" ADD CONSTRAINT "HumanValidation_validatedByUserId_fkey" FOREIGN KEY ("validatedByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
