import { Test, TestingModule } from '@nestjs/testing';
import { ModeleController } from './modele.controller';

describe('ModeleController', () => {
  let controller: ModeleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModeleController],
    }).compile();

    controller = module.get<ModeleController>(ModeleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
