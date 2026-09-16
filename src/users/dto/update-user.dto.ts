import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'Maria Silva',
    description: 'Nome público do usuário autenticado.',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;
}
