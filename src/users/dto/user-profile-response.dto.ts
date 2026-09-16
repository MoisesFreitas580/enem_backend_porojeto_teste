import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class UserProfileResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: 'Maria Silva' })
  name!: string;

  @ApiProperty({ example: 'maria@email.com' })
  email!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.STUDENT })
  role!: UserRole;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
