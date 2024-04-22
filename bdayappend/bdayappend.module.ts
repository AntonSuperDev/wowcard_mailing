import { Module } from '@nestjs/common';
import { BdayappendService } from './bdayappend.service';
import { BdayAppendDistanceService } from './bdayappend.distance.service';
import { BdayWriteToDBService } from './bdayappend.writedb.service';

@Module({
  providers: [
    BdayappendService,
    BdayAppendDistanceService,
    BdayWriteToDBService
  ],
  exports: [
    BdayappendService,
    BdayAppendDistanceService,
    BdayWriteToDBService
  ]
})
export class BdayappendModule {}
