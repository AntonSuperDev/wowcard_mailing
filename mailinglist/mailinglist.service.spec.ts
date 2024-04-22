import { Test, TestingModule } from '@nestjs/testing';
import { MailinglistService } from './mailinglist.service';

describe('MailinglistService', () => {
  let service: MailinglistService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailinglistService],
    }).compile();

    service = module.get<MailinglistService>(MailinglistService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
