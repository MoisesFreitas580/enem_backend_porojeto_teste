import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateAvulsoAttemptSessionDto {
  // @ApiProperty({
  //   example: '550e8400-e29b-41d4-a716-446655440999',
  //   description: 'UUID do usuário dono da tentativa',
  // })
  // @IsUUID()
  // userId!: string;

  @ApiProperty({
    type: [String],
    description:
      'Lista de UUIDs das questões que serão resolvidas na sessão avulsa',
    example: ['550e8400-e29b-41d4-a716-446655440111'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  questionIds!: string[];

  @ApiPropertyOptional({
    example: 'Lista avulsa de revisão - Matemática',
    description: 'Título opcional para identificar a sessão',
  })
  @IsOptional()
  @IsString()
  title?: string;
}
