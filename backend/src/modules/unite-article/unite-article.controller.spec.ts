import { Test, TestingModule } from '@nestjs/testing';
import { UniteArticleController } from './unite-article.controller';
import { UniteArticleService } from './unite-article.service';

describe('UniteArticleController', () => {
  let controller: UniteArticleController;

  const mockUniteArticleService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UniteArticleController],
      providers: [
        {
          provide: UniteArticleService,
          useValue: mockUniteArticleService,
        },
      ],
    }).compile();

    controller = module.get<UniteArticleController>(UniteArticleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});