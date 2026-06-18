import { Test, TestingModule } from '@nestjs/testing';
import { MaterielController } from './materiel.controller';
import { MaterielService } from './materiel.service';

describe('MaterielController', () => {
  let controller: MaterielController;

  const mockMaterielService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaterielController],
      providers: [
        {
          provide: MaterielService,
          useValue: mockMaterielService,
        },
      ],
    }).compile();

    controller = module.get<MaterielController>(MaterielController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});