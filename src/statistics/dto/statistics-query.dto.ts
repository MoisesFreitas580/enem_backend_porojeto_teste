import { ApiPropertyOptional } from '@nestjs/swagger';
import { AttemptSessionType } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';

export class StatisticsQueryDto {
  @ApiPropertyOptional({
    example: '2026-01-01',
    description: 'Data inicial do filtro',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    example: '2026-12-31',
    description: 'Data final do filtro',
  })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    enum: AttemptSessionType,
    description: 'Filtrar por tipo de sessão',
  })
  @IsOptional()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  @IsEnum(AttemptSessionType)
  type?: AttemptSessionType;
}
