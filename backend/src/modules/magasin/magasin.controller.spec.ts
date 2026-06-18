import { Test, TestingModule } from '@nestjs/testing';
import { MagasinController } from './magasin.controller';

describe('MagasinController', () => {
  let controller: MagasinController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MagasinController],
    }).compile();

    controller = module.get<MagasinController>(MagasinController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
