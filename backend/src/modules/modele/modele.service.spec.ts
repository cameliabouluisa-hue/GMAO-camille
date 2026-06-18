import { Test, TestingModule } from '@nestjs/testing';
import { ModeleService } from './modele.service';

describe('ModeleService', () => {
  let service: ModeleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ModeleService],
    }).compile();

    service = module.get<ModeleService>(ModeleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
