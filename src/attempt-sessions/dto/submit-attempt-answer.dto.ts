import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class SubmitAttemptAnswerDto {
  // @ApiProperty({
  //   example: '550e8400-e29b-41d4-a716-446655440999',
  //   description: 'UUID do usuário dono da tentativa',
  // })
  // @IsUUID()
  // userId!: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440444',
    description: 'UUID da alternativa marcada pelo aluno',
  })
  @IsOptional()
  @IsUUID()
  selectedAlternativeId?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Indica se o aluno deixou a questão em branco',
  })
  @IsOptional()
  @IsBoolean()
  isSkipped?: boolean;

  @ApiPropertyOptional({
    example: 85000,
    description: 'Tempo gasto na questão em milissegundos',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  timeSpentMs?: number;

  @ApiPropertyOptional({
    example: 1,
    description:
      'Quantidade de vezes que o aluno revisou ou alterou a resposta',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  reviewCount?: number;

  @ApiPropertyOptional({
    example: 4,
    description: 'Nível de confiança do aluno na resposta, de 1 a 5',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  confidenceLevel?: number;
}
