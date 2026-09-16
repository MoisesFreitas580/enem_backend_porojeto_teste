import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { SimulationsService } from './simulations.service';

describe('SimulationsService', () => {
  let service: SimulationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SimulationsService,
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<SimulationsService>(SimulationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
