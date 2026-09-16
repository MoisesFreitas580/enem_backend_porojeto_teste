import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      select: this.userProfileSelect(),
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return user;
  }

  async updateMe(userId: string, dto: UpdateUserDto) {
    await this.ensureActiveUser(userId);

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
      },
      select: this.userProfileSelect(),
    });
  }

  async softDeleteMe(userId: string) {
    await this.ensureActiveUser(userId);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
      },
      select: {
        id: true,
      },
    });

    return {
      message: 'Conta desativada com sucesso.',
    };
  }

  private async ensureActiveUser(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }
  }

  private userProfileSelect() {
    return {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    } as const;
  }
}
