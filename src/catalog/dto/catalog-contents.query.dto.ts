import { IsOptional, IsUUID } from 'class-validator';
import { ListQueryDto } from './list-query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CatalogContentsQueryDto extends ListQueryDto {
  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID do KnowledgeObject (filtra conteúdos ligados a ele)',
  })
  @IsOptional()
  @IsUUID()
  knowledgeObjectId?: string;
}
