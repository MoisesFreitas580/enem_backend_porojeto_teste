import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from 'src/auth/types/authenticated-request.type';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Retorna o perfil do usuário autenticado' })
  @ApiOkResponse({ type: UserProfileResponseDto })
  getMe(@Req() req: AuthenticatedRequest) {
    return this.usersService.getMe(req.user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Atualiza o perfil do usuário autenticado' })
  @ApiOkResponse({ type: UserProfileResponseDto })
  updateMe(
    @Req() req: AuthenticatedRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateMe(req.user.id, updateUserDto);
  }

  @Delete('me')
  @ApiOperation({
    summary: 'Desativa a conta do usuário autenticado',
    description:
      'Executa soft delete preenchendo deletedAt. O histórico pedagógico é preservado.',
  })
  @ApiOkResponse({ description: 'Conta desativada com sucesso.' })
  softDeleteMe(@Req() req: AuthenticatedRequest) {
    return this.usersService.softDeleteMe(req.user.id);
  }
}
