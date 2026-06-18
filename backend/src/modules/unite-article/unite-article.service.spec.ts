import { Test, TestingModule } from '@nestjs/testing';
import { UniteArticleService } from './unite-article.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('UniteArticleService', () => {
  let service: UniteArticleService;

  const mockPrismaService = {
    unite_article: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    article: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UniteArticleService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UniteArticleService>(UniteArticleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});