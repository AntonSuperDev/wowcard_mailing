import { Test, TestingModule } from '@nestjs/testing';
import { TekService } from './tek.service';

describe('TekService', () => {
  let service: TekService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TekService],
    }).compile();

    service = module.get<TekService>(TekService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
