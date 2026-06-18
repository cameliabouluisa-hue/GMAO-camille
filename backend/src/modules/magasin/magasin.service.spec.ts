import { Test, TestingModule } from '@nestjs/testing';
import { MagasinService } from './magasin.service';

describe('MagasinService', () => {
  let service: MagasinService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MagasinService],
    }).compile();

    service = module.get<MagasinService>(MagasinService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
