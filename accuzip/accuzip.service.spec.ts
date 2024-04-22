import { Test, TestingModule } from '@nestjs/testing';
import { AccuzipService } from './accuzip.service';

describe('AccuzipService', () => {
  let service: AccuzipService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccuzipService],
    }).compile();

    service = module.get<AccuzipService>(AccuzipService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
