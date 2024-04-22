import { Module } from '@nestjs/common';
import { BdayappendModule } from '../bdayappend/bdayappend.module';
import { AccuzipService } from './accuzip.service';
import { AccuzipWriteToDBService } from './accuzip.writetodb.service';
import { AccuzipOutputService } from './accuzip.output.service';
import { AccuzipCalculateDistanceService } from './accuzip.calculatedistance.service';
import { AccuzipEnhandedService } from './accuzip.enhanced.service';
import { AccuzipReportMailingService } from './accuzip.report.mailinglists';

@Module({
  imports: [BdayappendModule],
  exports: [
    AccuzipWriteToDBService, 
    AccuzipService, 
    AccuzipOutputService,
    AccuzipEnhandedService,
    AccuzipReportMailingService
  ],
  providers: [
    AccuzipService, 
    AccuzipWriteToDBService, 
    AccuzipOutputService, 
    AccuzipCalculateDistanceService,
    AccuzipEnhandedService,
    AccuzipReportMailingService
  ]
})
export class AccuzipModule {}
