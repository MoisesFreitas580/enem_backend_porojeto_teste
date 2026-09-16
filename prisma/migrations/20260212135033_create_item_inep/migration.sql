/*
  Warnings:

  - The primary key for the `InepItemMicrodata` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `extra` on the `InepItemMicrodata` table. All the data in the column will be lost.
  - You are about to drop the column `inepItemCode` on the `InepItemMicrodata` table. All the data in the column will be lost.
  - You are about to drop the column `numparamA` on the `InepItemMicrodata` table. All the data in the column will be lost.
  - You are about to drop the column `numparamB` on the `InepItemMicrodata` table. All the data in the column will be lost.
  - You are about to drop the column `numparamC` on the `InepItemMicrodata` table. All the data in the column will be lost.
  - You are about to drop the column `questionId` on the `InepItemMicrodata` table. All the data in the column will be lost.
  - The `id` column on the `InepItemMicrodata` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[year,application,day,coProva,coPosicao]` on the table `InepItemMicrodata` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `application` to the `InepItemMicrodata` table without a default value. This is not possible if the table is not empty.
  - Added the required column `coPosicao` to the `InepItemMicrodata` table without a default value. This is not possible if the table is not empty.
  - Added the required column `day` to the `InepItemMicrodata` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `InepItemMicrodata` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ApplicationType" AS ENUM ('REGULAR', 'PPL');

-- CreateEnum
CREATE TYPE "ExamDay" AS ENUM ('D1', 'D2');

-- DropForeignKey
ALTER TABLE "InepItemMicrodata" DROP CONSTRAINT "InepItemMicrodata_questionId_fkey";

-- DropIndex
DROP INDEX "InepItemMicrodata_inepItemCode_key";

-- DropIndex
DROP INDEX "InepItemMicrodata_questionId_key";

-- AlterTable
ALTER TABLE "InepItemMicrodata" DROP CONSTRAINT "InepItemMicrodata_pkey",
DROP COLUMN "extra",
DROP COLUMN "inepItemCode",
DROP COLUMN "numparamA",
DROP COLUMN "numparamB",
DROP COLUMN "numparamC",
DROP COLUMN "questionId",
ADD COLUMN     "application" "ApplicationType" NOT NULL,
ADD COLUMN     "coHabilidade" INTEGER,
ADD COLUMN     "coItem" BIGINT,
ADD COLUMN     "coPosicao" INTEGER NOT NULL,
ADD COLUMN     "coProva" BIGINT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "day" "ExamDay" NOT NULL,
ADD COLUMN     "inItemAban" INTEGER,
ADD COLUMN     "inItemAdaptado" INTEGER,
ADD COLUMN     "nuParamA" DECIMAL(65,30),
ADD COLUMN     "nuParamB" DECIMAL(65,30),
ADD COLUMN     "nuParamC" DECIMAL(65,30),
ADD COLUMN     "sgArea" VARCHAR(5),
ADD COLUMN     "tpLingua" INTEGER,
ADD COLUMN     "txCor" VARCHAR(30),
ADD COLUMN     "txGabarito" VARCHAR(10),
ADD COLUMN     "txMotivoAban" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
ADD CONSTRAINT "InepItemMicrodata_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "inepItemMicrodataId" BIGINT;

-- CreateIndex
CREATE INDEX "InepItemMicrodata_year_application_day_txCor_tpLingua_coPos_idx" ON "InepItemMicrodata"("year", "application", "day", "txCor", "tpLingua", "coPosicao");

-- CreateIndex
CREATE UNIQUE INDEX "InepItemMicrodata_year_application_day_coProva_coPosicao_key" ON "InepItemMicrodata"("year", "application", "day", "coProva", "coPosicao");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_inepItemMicrodataId_fkey" FOREIGN KEY ("inepItemMicrodataId") REFERENCES "InepItemMicrodata"("id") ON DELETE SET NULL ON UPDATE CASCADE;
