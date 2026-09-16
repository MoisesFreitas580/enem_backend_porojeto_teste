import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'maria@email.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'SenhaForte123',
  })
  @IsString()
  @MinLength(6)
  password!: string;
}
