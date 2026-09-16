/*
  Warnings:

  - A unique constraint covering the columns `[year,application,day,coProva,coPosicao,tpLingua]` on the table `InepItemMicrodata` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "InepItemMicrodata_year_application_day_coProva_coPosicao_key";

-- CreateIndex
CREATE UNIQUE INDEX "InepItemMicrodata_year_application_day_coProva_coPosicao_tp_key" ON "InepItemMicrodata"("year", "application", "day", "coProva", "coPosicao", "tpLingua");
