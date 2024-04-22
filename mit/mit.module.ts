import { Module } from '@nestjs/common';
import { MitService } from './mit.service';

@Module({
  providers: [MitService],
  exports: [MitService]
})
export class MitModule {}
