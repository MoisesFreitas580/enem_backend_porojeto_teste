import { Test, TestingModule } from '@nestjs/testing';
import { AttemptSessionsController } from './attempt-sessions.controller';
import { AttemptSessionsService } from './attempt-sessions.service';

describe('AttemptSessionsController', () => {
  let controller: AttemptSessionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttemptSessionsController],
      providers: [{ provide: AttemptSessionsService, useValue: {} }],
    }).compile();

    controller = module.get<AttemptSessionsController>(
      AttemptSessionsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
