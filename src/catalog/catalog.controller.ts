import { Controller, Get, Header, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { CatalogAreasQueryDto } from './dto/catalog-areas.query.dto';
import { CatalogDisciplinesQueryDto } from './dto/catalog-disciplines.query.dto';
import { CatalogCompetenciesQueryDto } from './dto/catalog-competencies.query.dto';
import { CatalogSkillsQueryDto } from './dto/catalog-skills.query.dto';
import { CatalogKnowledgeObjectsQueryDto } from './dto/catalog-knowledge-objects.query.dto';
import { CatalogContentsQueryDto } from './dto/catalog-contents.query.dto';

@ApiTags('Catálogo')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('areas')
  @ApiOperation({ summary: 'Lista áreas (LC/MT/CH/CN)' })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Busca por nome (contains, case-insensitive)',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Página (padrão 1)' })
  @ApiQuery({
    name: 'perPage',
    required: false,
    description: 'Itens por página (padrão 50, máximo 100)',
  })
  @Header('Cache-Control', 'public, max-age=3600') // 1h
  areas(@Query() query: CatalogAreasQueryDto) {
    return this.catalogService.listAreas(query);
  }

  @Get('disciplines')
  @ApiOperation({
    summary: 'Lista disciplinas (opcionalmente filtradas por área)',
  })
  @ApiQuery({
    name: 'area',
    required: false,
    description: 'LC | CH | CN | MT',
  })
  @ApiQuery({
    name: 'areaCode',
    required: false,
    description: 'LC | CH | CN | MT',
  })
  @ApiQuery({
    name: 'areaId',
    required: false,
    description: 'UUID da área (use OU areaId OU areaCode)',
  })
  @ApiQuery({ name: 'q', required: false, description: 'Busca por nome' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  disciplines(@Query() query: CatalogDisciplinesQueryDto) {
    return this.catalogService.listDisciplines(query);
  }

  @Get('competencies')
  @ApiOperation({ summary: 'Lista competências (filtráveis por área)' })
  @ApiQuery({
    name: 'areaCode',
    required: false,
    description: 'LC | CH | CN | MT',
  })
  @ApiQuery({
    name: 'areaId',
    required: false,
    description: 'UUID da área (use OU areaId OU areaCode)',
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  competencies(@Query() query: CatalogCompetenciesQueryDto) {
    return this.catalogService.listCompetencies(query);
  }

  @Get('skills')
  @ApiOperation({
    summary: 'Lista habilidades (filtráveis por competencyId ou por areaCode)',
    description:
      'Regras: (1) areaCode sozinho → skills da área. (2) competencyId → skills da competência. (3) areaCode + competencyCode (C1 ou 1) → skills daquela competência na área.',
  })
  @ApiQuery({
    name: 'competencyId',
    required: false,
    description: 'UUID da competência (recomendado)',
  })
  @ApiQuery({
    name: 'area',
    required: false,
    description: 'LC | CH | CN | MT (retorna todas as skills da área)',
  })
  @ApiQuery({
    name: 'areaCode',
    required: false,
    description: 'LC | CH | CN | MT (retorna todas as skills da área)',
  })
  @ApiQuery({ name: 'competencyCode', required: false })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Busca em code/description',
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  skills(@Query() query: CatalogSkillsQueryDto) {
    return this.catalogService.listSkills(query);
  }

  @Get('knowledge-objects')
  @ApiOperation({
    summary: 'Lista objetos de conhecimento (filtráveis por disciplina)',
  })
  @ApiQuery({
    name: 'disciplineId',
    required: false,
    description: 'UUID da disciplina',
  })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  knowledgeObjects(@Query() query: CatalogKnowledgeObjectsQueryDto) {
    return this.catalogService.listKnowledgeObjects(query);
  }

  @Get('contents')
  @ApiOperation({
    summary:
      'Lista conteúdos (tags). Pode buscar por texto ou por knowledgeObjectId',
  })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Busca por nome (contains)',
  })
  @ApiQuery({
    name: 'knowledgeObjectId',
    required: false,
    description: 'UUID do objeto de conhecimento (filtra via ObjectContent)',
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  contents(@Query() query: CatalogContentsQueryDto) {
    return this.catalogService.listContents(query);
  }
}
