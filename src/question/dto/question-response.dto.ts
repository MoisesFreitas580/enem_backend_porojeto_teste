import { ApiProperty } from '@nestjs/swagger';
import {
  ApplicationType,
  AreaCode,
  BlockType,
  ExamDay,
  UserRole,
  ValidationStatus,
} from '@prisma/client';

/**
 * =====================
 * META DE PAGINAÇÃO
 * =====================
 */
export class QuestionsPaginationMetaDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 180 })
  total!: number;

  @ApiProperty({ example: 9 })
  totalPages!: number;
}

/**
 * =====================
 * EXAME
 * =====================
 */
export class QuestionExamSummaryDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({ example: 2015 })
  year!: number;

  @ApiProperty({ enum: ExamDay, example: ExamDay.D1 })
  day!: ExamDay;

  @ApiProperty({ enum: ApplicationType, example: ApplicationType.PPL })
  type!: ApplicationType;
}

export class QuestionExamDetailDto extends QuestionExamSummaryDto {
  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

/**
 * =====================
 * SKILL / COMPETENCY / AREA
 * =====================
 */
export class QuestionAreaDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440010',
  })
  id!: string;

  @ApiProperty({ enum: AreaCode, example: AreaCode.LC })
  code!: AreaCode;

  @ApiProperty({ example: 'Linguagens, Códigos e suas Tecnologias' })
  name!: string;
}

export class QuestionCompetencySummaryDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440020',
  })
  id!: string;

  @ApiProperty({ example: 1 })
  code!: number;
}

export class QuestionCompetencyDetailDto extends QuestionCompetencySummaryDto {
  @ApiProperty({ nullable: true, example: 'Descrição da competência' })
  description!: string | null;

  @ApiProperty({ type: QuestionAreaDto })
  area!: QuestionAreaDto;
}

export class QuestionSkillSummaryDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440030',
  })
  id!: string;

  @ApiProperty({ example: 'H12' })
  code!: string;

  @ApiProperty({ type: QuestionCompetencySummaryDto })
  competency!: QuestionCompetencySummaryDto;
}

export class QuestionSkillDetailDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440030',
  })
  id!: string;

  @ApiProperty({ example: 'H12' })
  code!: string;

  @ApiProperty({ nullable: true, example: 'Descrição da habilidade' })
  description!: string | null;

  @ApiProperty({ type: QuestionCompetencyDetailDto })
  competency!: QuestionCompetencyDetailDto;
}

/**
 * =====================
 * BLOCOS E ALTERNATIVAS
 * =====================
 */
export class QuestionBlockSummaryDto {
  @ApiProperty({ enum: BlockType, example: BlockType.TEXT })
  type!: BlockType;

  @ApiProperty({ nullable: true, example: 'Enunciado resumido...' })
  text!: string | null;
}

export class QuestionBlockDetailDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440040',
  })
  id!: string;

  @ApiProperty({ enum: BlockType, example: BlockType.TEXT })
  type!: BlockType;

  @ApiProperty({ example: 1 })
  order!: number;

  @ApiProperty({ nullable: true, example: 'Texto completo do enunciado...' })
  text!: string | null;

  @ApiProperty({ nullable: true, example: null })
  imageUrl!: string | null;
}

export class QuestionAlternativeDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440050',
  })
  id!: string;

  @ApiProperty({ example: 'A' })
  letter!: string;

  @ApiProperty({ example: 'Alternativa A...' })
  text!: string;
}

/**
 * =====================
 * DISCIPLINA / KNOWLEDGE OBJECT / CONTENT
 * =====================
 */
export class QuestionDisciplineAreaDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440060',
  })
  id!: string;

  @ApiProperty({ enum: AreaCode, example: AreaCode.MT })
  code!: AreaCode;

  @ApiProperty({ example: 'Matemática e suas Tecnologias' })
  name!: string;
}

export class QuestionDisciplineDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440070',
  })
  id!: string;

  @ApiProperty({ example: 'Matemática' })
  name!: string;

  @ApiProperty({ type: QuestionDisciplineAreaDto })
  area!: QuestionDisciplineAreaDto;
}

export class QuestionContentDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440080',
  })
  id!: string;

  @ApiProperty({ example: 'Geometria plana' })
  name!: string;
}

export class QuestionKnowledgeObjectDisciplineDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440090',
  })
  id!: string;

  @ApiProperty({ example: 'Matemática' })
  name!: string;

  @ApiProperty({ type: QuestionDisciplineAreaDto })
  area!: QuestionDisciplineAreaDto;
}

export class QuestionKnowledgeObjectDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440100',
  })
  id!: string;

  @ApiProperty({ example: 'Grandezas e Medidas' })
  name!: string;

  @ApiProperty({ type: QuestionKnowledgeObjectDisciplineDto })
  discipline!: QuestionKnowledgeObjectDisciplineDto;

  @ApiProperty({ type: [QuestionContentDto] })
  objectContents!: Array<{
    content: QuestionContentDto;
  }>;
}

/**
 * =====================
 * INEP MICRODATA
 * =====================
 */
export class QuestionInepMicrodataDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 2015 })
  year!: number;

  @ApiProperty({ enum: ApplicationType, example: ApplicationType.PPL })
  application!: ApplicationType;

  @ApiProperty({ enum: ExamDay, example: ExamDay.D1 })
  day!: ExamDay;

  @ApiProperty({ example: 35 })
  coPosicao!: number;

  @ApiProperty({ nullable: true, example: 'MT' })
  sgArea!: string | null;

  @ApiProperty({ nullable: true, example: 123456 })
  coItem!: number | null;

  @ApiProperty({ nullable: true, example: 12 })
  coHabilidade!: number | null;

  @ApiProperty({ nullable: true, example: 98765 })
  coProva!: number | null;

  @ApiProperty({ nullable: true, example: -1 })
  tpLingua!: number | null;
}

/**
 * =====================
 * IA / VALIDAÇÃO HUMANA
 * =====================
 */
export class QuestionValidationUserDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440110',
  })
  id!: string;

  @ApiProperty({ example: 'Maria' })
  name!: string;

  @ApiProperty({ example: 'maria@email.com' })
  email!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.TEACHER })
  role!: UserRole;
}

export class QuestionValidationDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440120',
  })
  id!: string;

  @ApiProperty({ enum: ValidationStatus, example: ValidationStatus.APPROVED })
  status!: ValidationStatus;

  @ApiProperty({ nullable: true, example: 'Validação aprovada' })
  notes!: string | null;

  @ApiProperty({ nullable: true })
  validatedAt!: Date | null;

  @ApiProperty({ type: QuestionValidationUserDto })
  validatedByUser!: QuestionValidationUserDto;
}

export class QuestionAiSuggestedSkillDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440130',
  })
  id!: string;

  @ApiProperty({ example: 'H12' })
  code!: string;
}

export class QuestionAiSuggestedDisciplineDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440140',
  })
  id!: string;

  @ApiProperty({ example: 'Matemática' })
  name!: string;
}

export class QuestionAiSuggestedKnowledgeObjectDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440150',
  })
  id!: string;

  @ApiProperty({ example: 'Grandezas e Medidas' })
  name!: string;
}

export class QuestionAiSuggestedContentDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440160',
  })
  id!: string;

  @ApiProperty({ example: 'Geometria plana' })
  name!: string;
}

export class QuestionAiClassificationDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440170',
  })
  id!: string;

  @ApiProperty({ example: 'gpt-4.1' })
  modelName!: string;

  @ApiProperty({ nullable: true, example: '2026-01' })
  modelVersion!: string | null;

  @ApiProperty({ nullable: true, example: 0.92 })
  confidence!: number | null;

  @ApiProperty({ nullable: true, example: 'A questão envolve...' })
  rationale!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty({ nullable: true, type: QuestionAiSuggestedSkillDto })
  suggestedSkill!: QuestionAiSuggestedSkillDto | null;

  @ApiProperty({ nullable: true, type: QuestionAiSuggestedDisciplineDto })
  suggestedDiscipline!: QuestionAiSuggestedDisciplineDto | null;

  @ApiProperty({ nullable: true, type: QuestionAiSuggestedKnowledgeObjectDto })
  suggestedKnowledgeObject!: QuestionAiSuggestedKnowledgeObjectDto | null;

  @ApiProperty({ nullable: true, type: QuestionAiSuggestedContentDto })
  suggestedContent!: QuestionAiSuggestedContentDto | null;

  @ApiProperty({ type: [QuestionValidationDto] })
  validations!: QuestionValidationDto[];
}

/**
 * =====================
 * LISTAGEM RESUMIDA
 * =====================
 */
export class QuestionSummaryItemDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440180',
  })
  id!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  examId!: string;

  @ApiProperty({ example: 35 })
  number!: number;

  @ApiProperty({ enum: AreaCode, example: AreaCode.MT })
  area!: AreaCode;

  @ApiProperty({ example: -1 })
  tpLingua!: number;

  @ApiProperty({
    nullable: true,
    example: '550e8400-e29b-41d4-a716-446655440181',
  })
  skillId!: string | null;

  @ApiProperty({ example: true })
  hasSkill!: boolean;

  @ApiProperty({ nullable: true, example: '123456' })
  inepItemCode!: string | null;

  @ApiProperty({ type: QuestionExamSummaryDto })
  exam!: QuestionExamSummaryDto;

  @ApiProperty({ nullable: true, type: QuestionSkillSummaryDto })
  skill!: QuestionSkillSummaryDto | null;

  @ApiProperty({ example: 'Texto inicial do enunciado...' })
  previewText!: string;
}

export class QuestionsSummaryResponseDto {
  @ApiProperty({ type: QuestionsPaginationMetaDto })
  meta!: QuestionsPaginationMetaDto;

  @ApiProperty({ type: [QuestionSummaryItemDto] })
  items!: QuestionSummaryItemDto[];
}

/**
 * =====================
 * LISTAGEM DETALHADA
 * =====================
 */
export class QuestionDetailedListItemDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440180',
  })
  id!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  examId!: string;

  @ApiProperty({ example: 35 })
  number!: number;

  @ApiProperty({ enum: AreaCode, example: AreaCode.MT })
  area!: AreaCode;

  @ApiProperty({ example: -1 })
  tpLingua!: number;

  @ApiProperty({
    nullable: true,
    example: '550e8400-e29b-41d4-a716-446655440181',
  })
  skillId!: string | null;

  @ApiProperty({ nullable: true, example: '123456' })
  inepItemCode!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({ type: QuestionExamSummaryDto })
  exam!: QuestionExamSummaryDto;

  @ApiProperty({ nullable: true, type: QuestionSkillDetailDto })
  skill!: QuestionSkillDetailDto | null;

  @ApiProperty({ type: [QuestionBlockDetailDto] })
  blocks!: QuestionBlockDetailDto[];

  @ApiProperty({ type: [QuestionAlternativeDto] })
  alternatives!: QuestionAlternativeDto[];

  @ApiProperty({ type: [Object] })
  questionDisciplines!: Array<{
    discipline: QuestionDisciplineDto;
  }>;

  @ApiProperty({ type: [Object] })
  questionKnowledgeObjects!: Array<{
    knowledgeObject: {
      id: string;
      name: string;
      discipline: {
        id: string;
        name: string;
        area: QuestionDisciplineAreaDto;
      };
    };
  }>;
}

export class QuestionsDetailedResponseDto {
  @ApiProperty({ type: QuestionsPaginationMetaDto })
  meta!: QuestionsPaginationMetaDto;

  @ApiProperty({ type: [QuestionDetailedListItemDto] })
  items!: QuestionDetailedListItemDto[];
}

/**
 * =====================
 * DETALHE POR ID
 * =====================
 */
export class QuestionDetailResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440180',
  })
  id!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  examId!: string;

  @ApiProperty({ example: 35 })
  number!: number;

  @ApiProperty({ enum: AreaCode, example: AreaCode.MT })
  area!: AreaCode;

  @ApiProperty({ example: -1 })
  tpLingua!: number;

  @ApiProperty({
    nullable: true,
    example: '550e8400-e29b-41d4-a716-446655440181',
  })
  skillId!: string | null;

  @ApiProperty({ nullable: true, example: '123456' })
  inepItemCode!: string | null;

  @ApiProperty({ nullable: true, example: {} })
  rawJson!: unknown;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({ type: QuestionExamDetailDto })
  exam!: QuestionExamDetailDto;

  @ApiProperty({ nullable: true, type: QuestionSkillDetailDto })
  skill!: QuestionSkillDetailDto | null;

  @ApiProperty({ type: [QuestionBlockDetailDto] })
  blocks!: QuestionBlockDetailDto[];

  @ApiProperty({ type: [QuestionAlternativeDto] })
  alternatives!: QuestionAlternativeDto[];

  @ApiProperty({ type: [Object] })
  questionDisciplines!: Array<{
    discipline: QuestionDisciplineDto;
  }>;

  @ApiProperty({ type: [Object] })
  questionKnowledgeObjects!: Array<{
    knowledgeObject: QuestionKnowledgeObjectDto;
  }>;

  @ApiProperty({ nullable: true, type: QuestionInepMicrodataDto })
  inepMicrodata!: QuestionInepMicrodataDto | null;

  @ApiProperty({ type: [QuestionAiClassificationDto] })
  aiClassifications!: QuestionAiClassificationDto[];
}
