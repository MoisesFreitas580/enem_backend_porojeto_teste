import { ApiPropertyOptional } from '@nestjs/swagger';
import { AreaCode } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID, Matches } from 'class-validator';
import { ListQueryDto } from './list-query.dto';

export class CatalogSkillsQueryDto extends ListQueryDto {
  @ApiPropertyOptional({
    enum: AreaCode,
    example: AreaCode.MT,
    description: 'Filtra por área. Se vier sozinho, retorna skills da área.',
  })
  @IsOptional()
  @IsEnum(AreaCode)
  areaCode?: AreaCode;

  @ApiPropertyOptional({
    enum: AreaCode,
    example: AreaCode.MT,
    description: 'Alias de areaCode (opcional)',
  })
  @IsOptional()
  @IsEnum(AreaCode)
  area?: AreaCode;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description:
      'UUID da competência. Se informado, retorna skills dessa competência.',
  })
  @IsOptional()
  @IsUUID()
  competencyId?: string;

  @ApiPropertyOptional({
    example: 'C1',
    description:
      'Código da competência (ex: C1, C2... ou 1,2...). Requer areaCode/area junto.',
  })
  @IsOptional()
  @IsString()
  @Matches(/^C?\d+$/i, {
    message: 'competencyCode deve ser C1, C2... ou 1, 2...',
  })
  competencyCode?: string;
}
