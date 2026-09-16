import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UpdateSimulationTitleDto {
  @ApiProperty({
    example: 'Novo título do simulado',
  })
  @IsString()
  @MinLength(1)
  title!: string;
}
