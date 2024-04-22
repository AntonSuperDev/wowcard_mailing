import { Module } from '@nestjs/common';
import { ExtraService } from './extra.service';
import { ExtraMailingService } from './extra.mailinglist.service';
import { BdayappendModule } from '../bdayappend/bdayappend.module';
import { ListcleanupModule } from '../listcleanup/listcleanup.module';

@Module({
  imports: [
    BdayappendModule,
    ListcleanupModule
  ],
  exports: [
    ExtraService,
    ExtraMailingService
  ],
  providers: [
    ExtraService,
    ExtraMailingService
  ]
})
export class ExtraModule {}
