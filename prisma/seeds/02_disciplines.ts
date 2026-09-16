import { prisma } from './_prisma';
import type { AreaCode } from '@prisma/client';

export async function seedDisciplines() {
  const disciplines: Array<{ areaCode: AreaCode; name: string }> = [
    { areaCode: 'LC' as const, name: 'Linguagens' },
    { areaCode: 'LC' as const, name: 'Inglês' },
    { areaCode: 'LC' as const, name: 'Espanhol' },
    { areaCode: 'LC' as const, name: 'Português' },
    { areaCode: 'LC' as const, name: 'Artes' },
    { areaCode: 'LC' as const, name: 'Educação Física' },
    {
      areaCode: 'LC' as const,
      name: 'Tecnologias da Informação e Comunicação',
    },
    { areaCode: 'MT' as const, name: 'Matemática' },
    { areaCode: 'CN' as const, name: 'Biologia' },
    { areaCode: 'CN' as const, name: 'Física' },
    { areaCode: 'CN' as const, name: 'Química' },
    { areaCode: 'CH' as const, name: 'Ciências Humanas' },
    { areaCode: 'CH' as const, name: 'Hstória' },
    { areaCode: 'CH' as const, name: 'Geografia' },
    { areaCode: 'CH' as const, name: 'Filosofia' },
    { areaCode: 'CH' as const, name: 'Sociologia' },
  ];

  const areas = await prisma.area.findMany();
  const areaIdByCode = new Map(areas.map((a) => [a.code, a.id]));

  for (const d of disciplines) {
    const areaId = areaIdByCode.get(d.areaCode);
    if (!areaId) throw new Error(`Area não encontrada: ${d.areaCode}`);

    await prisma.discipline.upsert({
      where: { areaId_name: { areaId, name: d.name } },
      update: {},
      create: { areaId, name: d.name },
    });
  }

  console.log('seed of Disciplines -- OK');
}
