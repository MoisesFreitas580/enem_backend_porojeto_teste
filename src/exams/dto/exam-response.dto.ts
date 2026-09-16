import { ApiProperty } from '@nestjs/swagger';
import { ApplicationType, ExamDay } from '@prisma/client';

export class ExamCountDto {
  @ApiProperty({ example: 90 })
  questions!: number;
}

export class ExamItemResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({ example: 2015 })
  year!: number;

  @ApiProperty({ enum: ApplicationType, example: ApplicationType.PPL })
  type!: ApplicationType;

  @ApiProperty({ enum: ExamDay, example: ExamDay.D1 })
  day!: ExamDay;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({ type: ExamCountDto })
  _count!: ExamCountDto;
}

export class ExamsMetaDto {
  @ApiProperty({ example: 2 })
  total!: number;
}

export class ListExamsResponseDto {
  @ApiProperty({ type: [ExamItemResponseDto] })
  data!: ExamItemResponseDto[];

  @ApiProperty({ type: ExamsMetaDto })
  meta!: ExamsMetaDto;
}
