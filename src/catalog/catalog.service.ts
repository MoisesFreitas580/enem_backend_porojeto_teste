import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CatalogAreasQueryDto } from './dto/catalog-areas.query.dto';
import { CatalogDisciplinesQueryDto } from './dto/catalog-disciplines.query.dto';
import { CatalogCompetenciesQueryDto } from './dto/catalog-competencies.query.dto';
import { CatalogSkillsQueryDto } from './dto/catalog-skills.query.dto';
import { CatalogKnowledgeObjectsQueryDto } from './dto/catalog-knowledge-objects.query.dto';
import { CatalogContentsQueryDto } from './dto/catalog-contents.query.dto';
import { buildPaginatedResponse } from 'src/common/dto/pagination.dto';

function buildPagination(page = 1, perPage = 50) {
  return { take: perPage, skip: (page - 1) * perPage };
}
function getPaginationValues(page?: number, perPage?: number) {
  return {
    page: page ?? 1,
    perPage: perPage ?? 50,
  };
}
function normalizeQ(q?: string) {
  const v = q?.trim();
  return v && v.length ? v : undefined;
}
function parseCompetencyCode(raw?: string): number | undefined {
  if (!raw) return undefined;
  const m = raw.trim().match(/^C?(\d+)$/i);
  if (!m) return undefined;
  return Number(m[1]);
}

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async listAreas(query: CatalogAreasQueryDto) {
    const { page, perPage } = getPaginationValues(query.page, query.perPage);
    const { take, skip } = buildPagination(page, perPage);
    const q = normalizeQ(query.q);

    const where: Prisma.AreaWhereInput = {};
    if (q) {
      where.name = { contains: q, mode: Prisma.QueryMode.insensitive };
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.area.count({ where }),
      this.prisma.area.findMany({
        where,
        select: { id: true, code: true, name: true },
        orderBy: [{ code: 'asc' }, { name: 'asc' }],
        take,
        skip,
      }),
    ]);

    return buildPaginatedResponse(data, total, page, perPage);
  }

  async listDisciplines(query: CatalogDisciplinesQueryDto) {
    const { page, perPage } = getPaginationValues(query.page, query.perPage);
    const { take, skip } = buildPagination(page, perPage);
    const q = normalizeQ(query.q);
    const areaCode = query.area ?? query.areaCode;

    // Evita ambiguidade: areaId junto com areaCode/area
    if (query.areaId && areaCode) {
      throw new BadRequestException('Use apenas um: areaId OU area/areaCode.');
    }

    const where: Prisma.DisciplineWhereInput = {};
    if (q) where.name = { contains: q, mode: Prisma.QueryMode.insensitive };

    if (query.areaId) {
      where.areaId = query.areaId;
    } else if (areaCode) {
      // relation Discipline -> Area (to-one): use is
      where.area = { is: { code: areaCode } };
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.discipline.count({ where }),
      this.prisma.discipline.findMany({
        where,
        select: { id: true, areaId: true, name: true },
        orderBy: [{ name: 'asc' }],
        take,
        skip,
      }),
    ]);

    return buildPaginatedResponse(data, total, page, perPage);
  }

  async listCompetencies(query: CatalogCompetenciesQueryDto) {
    const { page, perPage } = getPaginationValues(query.page, query.perPage);
    const { take, skip } = buildPagination(page, perPage);
    const areaCode = query.area ?? query.areaCode;

    if (query.areaId && areaCode) {
      throw new BadRequestException('Use apenas um: areaId OU area/areaCode.');
    }

    const where: Prisma.CompetencyWhereInput = {};
    if (query.areaId) {
      where.areaId = query.areaId;
    } else if (areaCode) {
      // Competency -> Area (to-one): use is
      where.area = { is: { code: areaCode } };
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.competency.count({ where }),
      this.prisma.competency.findMany({
        where,
        select: { id: true, areaId: true, code: true, description: true },
        orderBy: [{ code: 'asc' }],
        take,
        skip,
      }),
    ]);

    return buildPaginatedResponse(data, total, page, perPage);
  }
  async listSkills(query: CatalogSkillsQueryDto) {
    const { page, perPage } = getPaginationValues(query.page, query.perPage);
    const { take, skip } = buildPagination(page, perPage);
    const q = normalizeQ(query.q);

    const areaCode = query.area ?? query.areaCode;
    const competencyCodeNum = parseCompetencyCode(query.competencyCode);

    // Validações de regras
    if (query.competencyId && competencyCodeNum !== undefined) {
      throw new BadRequestException(
        'Use apenas um: competencyId OU competencyCode.',
      );
    }
    if (competencyCodeNum !== undefined && !areaCode) {
      // porque Competency.code é unique dentro da área (areaId + code)
      throw new BadRequestException(
        'Para usar competencyCode, informe também area/areaCode.',
      );
    }
    if (!areaCode && !query.competencyId && competencyCodeNum === undefined) {
      throw new BadRequestException(
        'Informe ao menos um filtro: area/areaCode OU competencyId OU (area + competencyCode).',
      );
    }

    const where: Prisma.SkillWhereInput = {};

    // 1) Filtrar por competência UUID
    if (query.competencyId) {
      where.competencyId = query.competencyId;

      // Se também veio área, amarra para validar consistência (opcional, mas bom)
      if (areaCode) {
        where.competency = { is: { area: { is: { code: areaCode } } } };
      }
    }
    // 2) Filtrar por área + competencyCode (C1/1)
    else if (competencyCodeNum !== undefined) {
      where.competency = {
        is: {
          code: competencyCodeNum,
          area: { is: { code: areaCode! } },
        },
      };
    }
    // 3) Só por área (todas as skills daquela área)
    else if (areaCode) {
      where.competency = { is: { area: { is: { code: areaCode } } } };
    }

    // Busca textual (code/description)
    if (q) {
      where.OR = [
        { code: { contains: q, mode: Prisma.QueryMode.insensitive } },
        { description: { contains: q, mode: Prisma.QueryMode.insensitive } },
      ];
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.skill.count({ where }),
      this.prisma.skill.findMany({
        where,
        select: { id: true, competencyId: true, code: true, description: true },
        orderBy: [{ code: 'asc' }],
        take,
        skip,
      }),
    ]);

    return buildPaginatedResponse(data, total, page, perPage);
  }

  async listKnowledgeObjects(query: CatalogKnowledgeObjectsQueryDto) {
    const { page, perPage } = getPaginationValues(query.page, query.perPage);
    const { take, skip } = buildPagination(page, perPage);
    const q = normalizeQ(query.q);

    const where: Prisma.KnowledgeObjectWhereInput = {};
    if (query.disciplineId) where.disciplineId = query.disciplineId;
    if (q) where.name = { contains: q, mode: Prisma.QueryMode.insensitive };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.knowledgeObject.count({ where }),
      this.prisma.knowledgeObject.findMany({
        where,
        select: { id: true, disciplineId: true, name: true },
        orderBy: [{ name: 'asc' }],
        take,
        skip,
      }),
    ]);

    return buildPaginatedResponse(data, total, page, perPage);
  }

  async listContents(query: CatalogContentsQueryDto) {
    const { page, perPage } = getPaginationValues(query.page, query.perPage);
    const { take, skip } = buildPagination(page, perPage);
    const q = normalizeQ(query.q);

    const where: Prisma.ContentWhereInput = {};
    if (q) where.name = { contains: q, mode: Prisma.QueryMode.insensitive };

    // Content tem relação objectContents (list), então usa some:
    if (query.knowledgeObjectId) {
      where.objectContents = {
        some: { knowledgeObjectId: query.knowledgeObjectId },
      };
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.content.count({ where }),
      this.prisma.content.findMany({
        where,
        select: { id: true, name: true },
        orderBy: [{ name: 'asc' }],
        take,
        skip,
      }),
    ]);

    return buildPaginatedResponse(data, total, page, perPage);
  }
}
