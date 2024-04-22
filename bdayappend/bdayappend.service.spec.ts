import { Test, TestingModule } from '@nestjs/testing';
import { BdayappendService } from './bdayappend.service';

describe('BdayappendService', () => {
  let service: BdayappendService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BdayappendService],
    }).compile();

    service = module.get<BdayappendService>(BdayappendService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
