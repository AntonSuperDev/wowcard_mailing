import { Module } from "@nestjs/common";
import { ReportService } from "./report.service";
import { ReportMailingListService } from "./report.mailinglist.service";
import { ReportMDRService } from "./report.mdr.service";
import { ReportSDRListService } from "./report.sdr.service";
import { ReportExportService } from "./report.export.validc";
import { BdayappendModule } from "../bdayappend/bdayappend.module";
import { MailinglistModule } from "../mailinglist/mailinglist.module";
import { ListcleanupModule } from "../listcleanup/listcleanup.module";
import { TekModule } from "../tek/tek.module";
import { ProModule } from "../pro/pro.module";
import { SwModule } from "../sw/sw.module";

@Module({
  imports: [
    BdayappendModule,
    MailinglistModule,
    ListcleanupModule,
    TekModule,
    ProModule,
    SwModule,
  ],
  providers: [
    ReportExportService,
    ReportService,
    ReportMailingListService,
    ReportMDRService,
    ReportSDRListService,
  ],
  exports: [
    ReportExportService,
    ReportService,
    ReportMailingListService,
    ReportMDRService,
    ReportSDRListService,
  ],
})
export class ReportModule {}
