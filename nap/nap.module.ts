import { Module } from '@nestjs/common';
import { NapService } from './nap.service';

@Module({
  providers: [NapService],
  exports: [NapService]
})
export class NapModule {}
