import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  const appServiceMock = {
    getHello: jest
      .fn()
      .mockReturnValue('Bem vindo a API de Provas do ENEM - Gratuito e sempre será !'),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: appServiceMock }],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return the API welcome message', () => {
      expect(appController.getHello()).toBe(
        'Bem vindo a API de Provas do ENEM - Gratuito e sempre será !',
      );
    });
  });
});
