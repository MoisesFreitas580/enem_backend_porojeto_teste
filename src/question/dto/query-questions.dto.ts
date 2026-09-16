import { ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationType, AreaCode, ExamDay } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  Matches,
} from 'class-validator';

export class QueryQuestionsDto {
  @ApiPropertyOptional({ example: 1, description: 'Página (padrão 1)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 20,
    description: 'Itens por página (padrão 20, máximo 100)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    example: false,
    description:
      'Se true, retorna listagem detalhada; se false, retorna listagem resumida',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  detailed?: boolean = false;

  /**
   * =====================
   * FILTROS DE EXAME
   * =====================
   */
  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID do exame',
  })
  @IsOptional()
  @IsUUID()
  examId?: string;

  @ApiPropertyOptional({
    example: 2015,
    description: 'Ano do exame',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1998)
  year?: number;

  @ApiPropertyOptional({
    enum: ApplicationType,
    example: ApplicationType.PPL,
    description: 'Tipo da aplicação do exame',
  })
  @IsOptional()
  @IsEnum(ApplicationType)
  type?: ApplicationType;

  @ApiPropertyOptional({
    enum: ExamDay,
    example: ExamDay.D1,
    description: 'Dia do exame',
  })
  @IsOptional()
  @IsEnum(ExamDay)
  day?: ExamDay;

  /**
   * =====================
   * FILTROS DA QUESTÃO
   * =====================
   */
  @ApiPropertyOptional({
    example: 35,
    description: 'Número da questão dentro do exame',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(180)
  number?: number;

  @ApiPropertyOptional({
    enum: AreaCode,
    example: AreaCode.MT,
    description: 'Área da questão',
  })
  @IsOptional()
  @IsEnum(AreaCode)
  area?: AreaCode;

  @ApiPropertyOptional({
    example: -1,
    description: '-1 não se aplica; 0 inglês; 1 espanhol',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tpLingua?: number;

  @ApiPropertyOptional({
    example: '123456',
    description: 'Código INEP do item',
  })
  @IsOptional()
  @IsString()
  inepItemCode?: string;

  /**
   * =====================
   * FILTROS PEDAGÓGICOS
   * =====================
   */
  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440111',
    description: 'UUID da skill/habilidade',
  })
  @IsOptional()
  @IsUUID()
  skillId?: string;

  @ApiPropertyOptional({
    example: 'H12',
    description: 'Código da habilidade. Aceita H12 ou 12',
  })
  @IsOptional()
  @IsString()
  @Matches(/^H?\d+$/i, {
    message: 'skillCode deve estar no formato H1, H2... ou 1, 2...',
  })
  skillCode?: string;

  @ApiPropertyOptional({
    example: 'H12',
    description: 'Alias de skillCode',
  })
  @IsOptional()
  @IsString()
  @Matches(/^H?\d+$/i, {
    message: 'code deve estar no formato H1, H2... ou 1, 2...',
  })
  code?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440222',
    description: 'UUID da competência',
  })
  @IsOptional()
  @IsUUID()
  competencyId?: string;

  @ApiPropertyOptional({
    example: 'C1',
    description: 'Código da competência. Aceita C1 ou 1. Requer area.',
  })
  @IsOptional()
  @IsString()
  @Matches(/^C?\d+$/i, {
    message: 'competencyCode deve estar no formato C1, C2... ou 1, 2...',
  })
  competencyCode?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440333',
    description: 'UUID da disciplina',
  })
  @IsOptional()
  @IsUUID()
  disciplineId?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440444',
    description: 'UUID do objeto de conhecimento',
  })
  @IsOptional()
  @IsUUID()
  knowledgeObjectId?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440555',
    description: 'UUID do conteúdo',
  })
  @IsOptional()
  @IsUUID()
  contentId?: string;

  /**
   * =====================
   * FILTROS DE CURADORIA / COMPLETUDE
   * =====================
   */
  @ApiPropertyOptional({
    example: false,
    description: 'Filtra apenas questões sem skill',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  missingSkill?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Filtra apenas questões sem disciplina vinculada',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  missingDiscipline?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Filtra apenas questões sem objeto de conhecimento vinculado',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  missingKnowledgeObject?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Filtra apenas questões sem vínculo com microdados do INEP',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  missingInepMicrodata?: boolean;
}
