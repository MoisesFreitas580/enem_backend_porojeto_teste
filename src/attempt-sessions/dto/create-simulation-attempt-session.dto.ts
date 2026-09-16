import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSimulationAttemptSessionDto {
  // @ApiProperty({
  //   example: '550e8400-e29b-41d4-a716-446655440999',
  //   description: 'UUID do usuário dono da tentativa',
  // })
  // @IsUUID()
  // userId!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440222',
    description: 'UUID do simulado que será resolvido',
  })
  @IsUUID()
  simulationId!: string;

  @ApiPropertyOptional({
    example: 'Resolução do Simulado PPL 2015 D1',
    description: 'Título opcional para identificar a sessão',
  })
  @IsOptional()
  @IsString()
  title?: string;
}
