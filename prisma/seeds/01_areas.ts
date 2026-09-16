import { prisma } from './_prisma';
import type { AreaCode } from '@prisma/client';

export async function seedAreas() {
  const areas: Array<{ code: AreaCode; name: string }> = [
    { code: 'LC' as const, name: 'Linguagens, Códigos e suas Tecnologias' },
    { code: 'CH' as const, name: 'Ciências Humanas e suas Tecnologias' },
    { code: 'CN' as const, name: 'Ciências da Natureza e suas Tecnologias' },
    { code: 'MT' as const, name: 'Matemática e suas Tecnologias' },
  ];

  for (const a of areas) {
    await prisma.area.upsert({
      where: { code: a.code },
      update: { name: a.name },
      create: { code: a.code, name: a.name },
    });
  }

  console.log('seedAreas ---> OK');
}
