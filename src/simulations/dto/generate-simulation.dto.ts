import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { SimulationQuestionFiltersDto } from './simulation-question-filters.dto';

export class GenerateSimulationDto {
  @ApiPropertyOptional({
    example: 'Simulado PPL 2015 D1',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    type: SimulationQuestionFiltersDto,
    description: 'Filtros usados para encontrar as questões',
  })
  @IsObject()
  @ValidateNested()
  @Type(() => SimulationQuestionFiltersDto)
  filters!: SimulationQuestionFiltersDto;

  @ApiProperty({
    example: 'exact_exam',
    description: 'Estratégia de geração',
    enum: ['exact_exam', 'random', 'manual'],
  })
  @IsIn(['exact_exam', 'random', 'manual'])
  strategy!: 'exact_exam' | 'random' | 'manual';

  @ApiPropertyOptional({
    example: 10,
    description: 'Quantidade de questões. Obrigatória em random.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(180)
  quantity?: number;

  @ApiPropertyOptional({
    type: [String],
    description: 'QuestionIds para geração manual',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  questionIds?: string[];
}
