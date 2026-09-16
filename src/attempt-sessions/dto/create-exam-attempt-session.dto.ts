import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateExamAttemptSessionDto {
  // @ApiProperty({
  //   example: '550e8400-e29b-41d4-a716-446655440999',
  //   description: 'UUID do usuário dono da tentativa',
  // })
  // @IsUUID()
  // userId!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440333',
    description: 'UUID da prova ENEM que será resolvida',
  })
  @IsUUID()
  examId!: string;

  @ApiPropertyOptional({
    example: 'ENEM 2015 PPL - Dia 1',
    description: 'Título opcional para identificar a sessão',
  })
  @IsOptional()
  @IsString()
  title?: string;
}
