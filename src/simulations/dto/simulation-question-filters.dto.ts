import { ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationType, AreaCode, ExamDay } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class SimulationQuestionFiltersDto {
  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsUUID()
  examId?: string;

  @ApiPropertyOptional({ example: 2015 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1998)
  year?: number;

  @ApiPropertyOptional({ enum: ApplicationType, example: ApplicationType.PPL })
  @IsOptional()
  @IsEnum(ApplicationType)
  type?: ApplicationType;

  @ApiPropertyOptional({ enum: ExamDay, example: ExamDay.D1 })
  @IsOptional()
  @IsEnum(ExamDay)
  day?: ExamDay;

  @ApiPropertyOptional({ example: 35 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(180)
  number?: number;

  @ApiPropertyOptional({ enum: AreaCode, example: AreaCode.MT })
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

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440111' })
  @IsOptional()
  @IsUUID()
  skillId?: string;

  @ApiPropertyOptional({ example: 'H12' })
  @IsOptional()
  @IsString()
  @Matches(/^H?\d+$/i, {
    message: 'skillCode deve estar no formato H1, H2... ou 1, 2...',
  })
  skillCode?: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440222' })
  @IsOptional()
  @IsUUID()
  competencyId?: string;

  @ApiPropertyOptional({
    example: 'C1',
    description: 'Aceita C1 ou 1. Requer area.',
  })
  @IsOptional()
  @IsString()
  @Matches(/^C?\d+$/i, {
    message: 'competencyCode deve estar no formato C1, C2... ou 1, 2...',
  })
  competencyCode?: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440333' })
  @IsOptional()
  @IsUUID()
  disciplineId?: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440444' })
  @IsOptional()
  @IsUUID()
  knowledgeObjectId?: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440555' })
  @IsOptional()
  @IsUUID()
  contentId?: string;
}
