import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationType, ExamDay } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';

export class ListExamQuestionsQueryDto {
  @ApiProperty({
    enum: ApplicationType,
    example: ApplicationType.PPL,
    description: 'Tipo da aplicação do exame',
  })
  @IsEnum(ApplicationType)
  type!: ApplicationType;

  @ApiProperty({
    example: 2015,
    description: 'Ano do exame',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1998)
  year!: number;

  @ApiPropertyOptional({
    enum: ExamDay,
    example: ExamDay.D1,
    description: 'Dia do exame. Se omitido, retorna questões de D1 + D2.',
  })
  @IsOptional()
  @IsEnum(ExamDay)
  day?: ExamDay;
}
