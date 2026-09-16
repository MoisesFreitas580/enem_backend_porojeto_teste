import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'Maria Silva',
    description: 'Nome completo do usuário',
  })
  @IsString()
  @MinLength(3)
  name!: string;

  @ApiProperty({
    example: 'maria@email.com',
    description: 'E-mail usado para login',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'SenhaForte123',
    description: 'Senha do usuário',
  })
  @IsString()
  @MinLength(6)
  password!: string;
}
