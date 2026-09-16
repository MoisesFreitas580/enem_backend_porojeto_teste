import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: { sign: jest.fn() } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('rejects login for a soft deleted user', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-id',
      name: 'Maria',
      email: 'maria@email.com',
      role: 'STUDENT',
      passwordHash: 'hash',
      deletedAt: new Date(),
    });

    await expect(
      service.login({
        email: 'maria@email.com',
        password: 'Senha123',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
