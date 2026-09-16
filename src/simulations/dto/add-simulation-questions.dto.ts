import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsUUID } from 'class-validator';

export class AddSimulationQuestionsDto {
  @ApiProperty({
    type: [String],
    example: [
      '550e8400-e29b-41d4-a716-446655440001',
      '550e8400-e29b-41d4-a716-446655440002',
    ],
  })
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  questionIds!: string[];
}
