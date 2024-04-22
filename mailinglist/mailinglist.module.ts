import { Module } from "@nestjs/common";
import { BdayappendModule } from "../bdayappend/bdayappend.module";
import { MailinglistService } from "./mailinglist.service";
import { MailinglistCountsService } from "./mailinglist.counts.service";
import { MailinglistMaxListService } from "./mailinglist.maxlists.service";
import { MailinglistSaveCSVService } from "./mailinglist.savecsv.service";
import { MailinglistGenerateService } from "./mailinglist.generate.service";
import { MailinglistReadPrevMonthService } from "./mailinglist.readpremonth.service";
import { MailinglistWriteAccuzipToDBService } from "./mailinglist.writeaccuziptodb.service";
import { MailinglistGetValidCustomerService } from "./mailinglist.getvalidcustomers.service";

@Module({
  imports: [BdayappendModule],
  providers: [
    MailinglistService,
    MailinglistCountsService,
    MailinglistMaxListService,
    MailinglistSaveCSVService,
    MailinglistGenerateService,
    MailinglistReadPrevMonthService,
    MailinglistWriteAccuzipToDBService,
    MailinglistGetValidCustomerService,
  ],
  exports: [
    MailinglistService,
    MailinglistCountsService,
    MailinglistMaxListService,
    MailinglistSaveCSVService,
    MailinglistGenerateService,
    MailinglistReadPrevMonthService,
    MailinglistWriteAccuzipToDBService,
    MailinglistGetValidCustomerService,
  ],
})
export class MailinglistModule {}
