import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { SimulationQuestionFiltersDto } from './simulation-question-filters.dto';

export class CreateSimulationDto {
  @ApiPropertyOptional({
    example: 'Treino de Matemática',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Filtros associados ao simulado para referência futura',
    type: SimulationQuestionFiltersDto,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SimulationQuestionFiltersDto)
  filters?: SimulationQuestionFiltersDto;

  @ApiPropertyOptional({
    type: [String],
    example: [
      '550e8400-e29b-41d4-a716-446655440001',
      '550e8400-e29b-41d4-a716-446655440002',
    ],
    description: 'Lista manual de questionIds',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  questionIds?: string[];
}
