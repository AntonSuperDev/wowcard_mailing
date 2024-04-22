import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";
import { NestSessionOptions, SessionModule } from "nestjs-session";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DbModule } from "./db/db.module";
import { JobsModule } from "./jobs/jobs.module";
import { TekModule } from './tek/tek.module';
import { ListcleanupModule } from './listcleanup/listcleanup.module';
import { SwModule } from './sw/sw.module';
import { ProModule } from './pro/pro.module';
import { NapModule } from './nap/nap.module';
import { MitModule } from './mit/mit.module';
import { MailinglistModule } from './mailinglist/mailinglist.module';
import { BdayappendModule } from './bdayappend/bdayappend.module';
import { ReportModule } from './report/report.module';
import { ExtraModule } from './extra/extra.module';
import { UpdatedbModule } from './updatedb/updatedb.module';
import { AccuzipModule } from './accuzip/accuzip.module';
import { BdayModule } from './bday/bday.module';

@Module({
  imports: [
    DbModule,
    JobsModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    SessionModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): NestSessionOptions => ({
        session: {
          secret: config.get<string>("SESSION_SECRET", ""),
          resave: false,
          saveUninitialized: false,
        },
      }),
    }),
    TekModule,
    ListcleanupModule,
    SwModule,
    ProModule,
    NapModule,
    MitModule,
    MailinglistModule,
    BdayappendModule,
    ReportModule,
    ExtraModule,
    UpdatedbModule,
    AccuzipModule,
    BdayModule,
  ],
  controllers: [AppController],
  providers: [
    // Enable authentication guards globally
    {
      provide: APP_INTERCEPTOR,
      useFactory: () => null,
    },
    AppService,
  ],
})
export class AppModule {}
