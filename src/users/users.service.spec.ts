import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    user: {
      findFirst: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns the authenticated active user without passwordHash', async () => {
    const user = {
      id: 'user-id',
      name: 'Maria',
      email: 'maria@email.com',
      role: 'STUDENT',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prisma.user.findFirst.mockResolvedValue(user);

    await expect(service.getMe('user-id')).resolves.toEqual(user);
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'user-id',
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });

  it('does not return a deleted user profile', async () => {
    prisma.user.findFirst.mockResolvedValue(null);

    await expect(service.getMe('user-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updates only the authenticated active user profile', async () => {
    const updated = {
      id: 'user-id',
      name: 'Novo Nome',
      email: 'maria@email.com',
      role: 'STUDENT',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prisma.user.findFirst.mockResolvedValue({ id: 'user-id' });
    prisma.user.update.mockResolvedValue(updated);

    await expect(
      service.updateMe('user-id', { name: '  Novo Nome  ' }),
    ).resolves.toEqual(updated);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-id' },
      data: { name: 'Novo Nome' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });

  it('soft deletes the authenticated active user', async () => {
    prisma.user.findFirst.mockResolvedValue({ id: 'user-id' });
    prisma.user.update.mockResolvedValue({ id: 'user-id' });

    await expect(service.softDeleteMe('user-id')).resolves.toEqual({
      message: 'Conta desativada com sucesso.',
    });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-id' },
      data: {
        deletedAt: expect.any(Date),
      },
      select: {
        id: true,
      },
    });
  });
});
