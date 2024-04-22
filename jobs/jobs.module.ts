import { Module } from "@nestjs/common";
import { JobsService } from "./jobs.service";
import { TekModule } from "../tek/tek.module";
import { SwModule } from "../sw/sw.module";
import { ProModule } from "../pro/pro.module";
import { NapModule } from "../nap/nap.module";
import { MitModule } from "../mit/mit.module";
import { ListcleanupModule } from "../listcleanup/listcleanup.module";
import { MailinglistModule } from "../mailinglist/mailinglist.module";
import { BdayappendModule } from "../bdayappend/bdayappend.module";
import { ReportModule } from "../report/report.module";
import { ExtraModule } from "../extra/extra.module";
import { UpdatedbModule } from "../updatedb/updatedb.module";
import { AccuzipModule } from "../accuzip/accuzip.module";
import { BdayModule } from "../bday/bday.module";

@Module({
  imports: [
    ExtraModule,
    TekModule,
    SwModule,
    ProModule,
    NapModule,
    MitModule,
    ListcleanupModule,
    MailinglistModule,
    BdayappendModule,
    ReportModule,
    UpdatedbModule,
    AccuzipModule,
    BdayModule
  ],
  providers: [JobsService],
})
export class JobsModule {}
