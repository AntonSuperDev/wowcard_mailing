import { Test, TestingModule } from '@nestjs/testing';
import { SwService } from './sw.service';

describe('SwService', () => {
  let service: SwService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SwService],
    }).compile();

    service = module.get<SwService>(SwService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
