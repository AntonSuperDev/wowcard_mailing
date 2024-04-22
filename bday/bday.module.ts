import { Module } from '@nestjs/common';
import { BdayService } from './bday.service';

@Module({
  exports: [BdayService],
  providers: [BdayService]
})
export class BdayModule {}
