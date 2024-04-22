import { Test, TestingModule } from '@nestjs/testing';
import { ListcleanupService } from './listcleanup.service';

describe('ListcleanupService', () => {
  let service: ListcleanupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ListcleanupService],
    }).compile();

    service = module.get<ListcleanupService>(ListcleanupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
