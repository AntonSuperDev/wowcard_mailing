import { Test, TestingModule } from '@nestjs/testing';
import { UpdatedbService } from './updatedb.service';

describe('UpdatedbService', () => {
  let service: UpdatedbService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UpdatedbService],
    }).compile();

    service = module.get<UpdatedbService>(UpdatedbService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
