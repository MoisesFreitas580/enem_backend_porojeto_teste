import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ListQueryDto } from './list-query.dto';
import { AreaCode } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CatalogDisciplinesQueryDto extends ListQueryDto {
  @ApiPropertyOptional({
    enum: AreaCode,
    example: AreaCode.MT,
    description: 'Alias de areaCode (LC/CH/CN/MT)',
  })
  @IsOptional()
  @IsEnum(AreaCode)
  area?: AreaCode; //alias para area code !

  @ApiPropertyOptional({
    enum: AreaCode,
    example: AreaCode.MT,
    description: 'Código da área (LC/CH/CN/MT)',
  })
  @IsOptional()
  @IsEnum(AreaCode)
  areaCode?: AreaCode;

  @ApiPropertyOptional({
    example: 'b3b6c1a2-8a27-4d62-9c04-2e7aef3c9b5a',
    description: 'UUID da área',
  })
  @IsOptional()
  @IsUUID()
  areaId?: string;
}
