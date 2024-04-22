import { Test, TestingModule } from '@nestjs/testing';
import { BdayService } from './bday.service';

describe('BdayService', () => {
  let service: BdayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BdayService],
    }).compile();

    service = module.get<BdayService>(BdayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
