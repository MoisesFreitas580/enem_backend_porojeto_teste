import { ApiProperty } from '@nestjs/swagger';
import { ApplicationType, ExamDay } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';

export class ListExamsQueryDto {
  @ApiProperty({
    enum: ApplicationType,
    example: ApplicationType.PPL,
    description: 'Tipo da aplicação da prova (PPL ou Regular)',
  })
  @IsEnum(ApplicationType)
  type!: ApplicationType;

  @ApiProperty({
    example: 2015,
    description: 'Ano do exame desejado',
  })
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  year!: number;

  @ApiProperty({
    enum: ExamDay,
    example: ExamDay.D1,
    description:
      'Dia do exame (D1 ou D2). Se omitido, retorna os exames do ano/tipo.',
  })
  @IsOptional()
  @IsEnum(ExamDay)
  day!: ExamDay;
}
