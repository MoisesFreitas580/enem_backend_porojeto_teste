import { ApiProperty } from '@nestjs/swagger';
import { AreaCode, ApplicationType, BlockType, ExamDay } from '@prisma/client';

export class ExamQuestionExamDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({ example: 2015 })
  year!: number;

  @ApiProperty({ enum: ApplicationType, example: ApplicationType.PPL })
  type!: ApplicationType;

  @ApiProperty({ enum: ExamDay, example: ExamDay.D1 })
  day!: ExamDay;
}

export class QuestionBlockResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({ enum: BlockType, example: BlockType.TEXT })
  type!: BlockType;

  @ApiProperty({ example: 1 })
  order!: number;

  @ApiProperty({ nullable: true, example: 'Texto do enunciado...' })
  text!: string | null;

  @ApiProperty({ nullable: true, example: null })
  imageUrl!: string | null;
}

export class AlternativeResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({ example: 'A' })
  letter!: string;

  @ApiProperty({ example: 'Alternativa A...' })
  text!: string;
}

export class ExamQuestionItemResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  examId!: string;

  @ApiProperty({ example: 1 })
  number!: number;

  @ApiProperty({ enum: AreaCode, example: AreaCode.LC })
  area!: AreaCode;

  @ApiProperty({
    example: -1,
    description: '-1 não se aplica; 0 inglês; 1 espanhol',
  })
  tpLingua!: number;

  @ApiProperty({
    nullable: true,
    example: '550e8400-e29b-41d4-a716-446655440999',
  })
  skillId!: string | null;

  @ApiProperty({ nullable: true, example: '123456' })
  inepItemCode!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({ type: ExamQuestionExamDto })
  exam!: ExamQuestionExamDto;

  @ApiProperty({ type: [QuestionBlockResponseDto] })
  blocks!: QuestionBlockResponseDto[];

  @ApiProperty({ type: [AlternativeResponseDto] })
  alternatives!: AlternativeResponseDto[];
}

export class ExamQuestionsMetaDto {
  @ApiProperty({ example: 90 })
  total!: number;
}

export class ListExamQuestionsResponseDto {
  @ApiProperty({ type: [ExamQuestionItemResponseDto] })
  data!: ExamQuestionItemResponseDto[];

  @ApiProperty({ type: ExamQuestionsMetaDto })
  meta!: ExamQuestionsMetaDto;
}
