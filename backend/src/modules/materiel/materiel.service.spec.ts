import { Test, TestingModule } from '@nestjs/testing';
import { MaterielService } from './materiel.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('MaterielService', () => {
  let service: MaterielService;

  const mockPrismaService = {
    materiel: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    article: {
      findUnique: jest.fn(),
    },
    modele: {
      findUnique: jest.fn(),
    },
    etat_materiel: {
      findUnique: jest.fn(),
    },
    type_materiel: {
      findUnique: jest.fn(),
    },
    demande_intervention: {
      count: jest.fn(),
    },
    intervention: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaterielService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MaterielService>(MaterielService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});