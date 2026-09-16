import { prisma } from './_prisma';
import { seedAreas } from './01_areas';
import { seedDisciplines } from './02_disciplines';
import { seedCompetenciesAndSkills } from './03_competencies_skills';
import { seedKnowledgeObjects } from './04_knowledge_objects';

async function main() {
  // Ordem segura: areas -> disciplines -> competencies/skills -> knowledgeObjects
  await seedAreas();
  await seedDisciplines();
  await seedCompetenciesAndSkills();
  await seedKnowledgeObjects();
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log(' Seeds finalizados com sucesso');
  })
  .catch(async (e) => {
    console.error(' Seed falhou:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
