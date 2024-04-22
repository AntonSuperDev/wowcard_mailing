import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import _, { countBy, result } from "lodash";

import { TekService } from "../tek/tek.service";
import { TekmetricCustomerService } from "../tek/tek.api.getcustomers.service";
import { TekmetricJobsService } from "../tek/tek.api.getjobs.service";
import { TekShopService } from "../tek/tek.api.getshops.service";
import { TekEmployeeService } from "../tek/tek.api.getemployee.service";
import { SwService } from "../sw/sw.service";
import { SWCustomerService } from "../sw/sw.api.getcustomers.service";
import { SWRepairOrderService } from "../sw/sw.api.getrepairorders.service";
import { ProService } from "../pro/pro.service";
import { ProDataService } from "../pro/pro.api.getdata.service";
import { NapService } from "../nap/nap.service";
import { ListcleanupNameService } from "../listcleanup/listcleanup.name.service";
import { ListcleanupAddressService } from "../listcleanup/listcleanup.address.service";
import { ListcleanupDedupeService } from "../listcleanup/listcleanup.dedupe.service";
import { ListcleanupService } from "../listcleanup/listcleanup.service";
import { MitService } from "../mit/mit.service";
import { BdayappendService } from "../bdayappend/bdayappend.service";
import { BdayWriteToDBService } from "../bdayappend/bdayappend.writedb.service";
import { MailinglistCountsService } from "../mailinglist/mailinglist.counts.service";
import { MailinglistMaxListService } from "../mailinglist/mailinglist.maxlists.service";
import { MailinglistSaveCSVService } from "../mailinglist/mailinglist.savecsv.service";
import { MailinglistGenerateService } from "../mailinglist/mailinglist.generate.service";
import { MailinglistWriteAccuzipToDBService } from "../mailinglist/mailinglist.writeaccuziptodb.service";
import { MailinglistService } from "../mailinglist/mailinglist.service";
import { ReportMailingListService } from "../report/report.mailinglist.service";
import { ReportMDRService } from "../report/report.mdr.service";
import { ReportSDRListService } from "../report/report.sdr.service";
import { ReportService } from "../report/report.service";
import { ReportExportService } from "../report/report.export.validc";
import { MailinglistGetValidCustomerService } from "../mailinglist/mailinglist.getvalidcustomers.service";
import { ExtraService } from "../extra/extra.service";
import { ExtraMailingService } from "../extra/extra.mailinglist.service";
import { UpdatedbService } from "../updatedb/updatedb.service";
import { AccuzipWriteToDBService } from "../accuzip/accuzip.writetodb.service";
import { AccuzipService } from "../accuzip/accuzip.service";
import { AccuzipOutputService } from "../accuzip/accuzip.output.service";
import { AccuzipEnhandedService } from "../accuzip/accuzip.enhanced.service";
import { BdayService } from "../bday/bday.service";
import { AccuzipReportMailingService } from "../accuzip/accuzip.report.mailinglists";

const allShops = {
  tek: [
    {wowShopId: 5018,
      shopName: "Boktor Motors",
      shopId: 8495,
      chainId: 0,
      software: "Tek",
    },
    {wowShopId: 5015,
      shopName: "Pitts Automotive Inc",
      shopId: 4839,
      chainId: 0,
      software: "Tek",
    },
    {wowShopId: 5010,
      shopName: "Pitts Automotive Inc",
      shopId: 3363,
      chainId: 0,
      software: "Tek",
    },
    
    {
      wowShopId: 5007,
      shopName: "High Tech Automotive",
      shopId: 3532,
      chainId: 0,
      software: "Tek",
    },
    {
      wowShopId: 5006,
      shopName: "George Automotive Services",
      shopId: 1104,
      chainId: 0,
      software: "Tek",
    },
    {
      wowShopId: 5005,
      shopName: "Pitts Automotive Inc",
      shopId: 4318,
      chainId: 0,
      software: "Tek",
    },
    {
      wowShopId: 5004,
      shopName: "Primary Care Auto Repair",
      shopId: 572,
      chainId: 0,
      software: "Tek",
    },
    {
      wowShopId: 5003,
      shopName: "High Tech Automotive",
      shopId: 7085,
      chainId: 0,
      software: "Tek",
    },
    
    {
      wowShopId: 5001,
      shopName: "George Automotive Services Bloomsburg",
      shopId: 5770,
      chainId: 0,
      software: "Tek",
    },
    {wowShopId: 1078,
      shopName: "Pitts Automotive Inc",
      shopId: 1565,
      chainId: 0,
      software: "Tek",
    },
    {
      wowShopId: 1077,
      shopName: "George Automotive Services",
      shopId: 194,
      chainId: 0,
      software: "Tek",
    },
    {wowShopId: 1076,
      shopName: "Pitts Automotive Inc",
      shopId: 5055,
      chainId: 0,
      software: "Tek",
    },
    {wowShopId: 1075,
      shopName: "Pitts Automotive Inc",
      shopId: 5054,
      chainId: 0,
      software: "Tek",
    },
    {wowShopId: 1074,
      shopName: "Pitts Automotive Inc",
      shopId: 5053,
      chainId: 0,
      software: "Tek",
    },
    {wowShopId: 1073,
      shopName: "Pitts Automotive Inc",
      shopId: 5052,
      chainId: 0,
      software: "Tek",
    },{
      wowShopId: 1072,
      shopName: "Primary Care Auto Repair",
      shopId: 7794,
      chainId: 0,
      software: "Tek",
    },{
      wowShopId: 1071,
      shopName: "Pitts Automotive Inc",
      shopId: 1759,
      chainId: 0,
      software: "Tek",
    },
    {
      wowShopId: 1070,
      shopName: "Pitts Automotive Inc",
      shopId: 4597,
      chainId: 0,
      software: "Tek",
    },
    {
      wowShopId: 1069,
      shopName: "Primary Care Auto Repair",
      shopId: 1270,
      chainId: 0,
      software: "Tek",
    },
    {
      wowShopId: 1068,
      shopName: "High Tech Automotive",
      shopId: 371,
      chainId: 0,
      software: "Tek",
    },
    {
      wowShopId: 1067,
      shopName: "CAR-AID Utica",
      shopId: 5519,
      chainId: 0,
      software: "Tek",
    },
    {
      wowShopId: 1066,
      shopName: "Car-Aid Shelby",
      shopId: 3826,
      chainId: 0,
      software: "Tek",
    },
    {
      wowShopId: 1065,
      shopName: "Car-Aid Southfield",
      shopId: 3828,
      chainId: 0,
      software: "Tek",
    },
    {
      wowShopId: 1064,
      shopName: "CROWN AUTO REPAIR",
      shopId: 3747,
      chainId: 0,
      software: "Tek",
    },
    {
      wowShopId: 1063,
      shopName: "Zima Automotive",
      shopId: 383,
      chainId: 0,
      software: "Tek",
    },
    {
      wowShopId: 1062,
      shopName: "Kolben Autohaus",
      shopId: 3228,
      chainId: 106,
      software: "Tek",
    },
    {
      wowShopId: 1061,
      shopName: "Millers Auto and Diesel Shop",
      shopId: 3045,
      chainId: 106,
      software: "Tek",
    },
    {
      wowShopId: 1060,
      shopName: "A-Plus",
      shopId: 2734,
      chainId: 106,
      software: "Tek",
    },
    {
      wowShopId: 1059,
      shopName: "mechanics",
      shopId: 1923,
      chainId: 0,
      software: "Tek",
    },
    {
      wowShopId: 1058,
      shopName: "Next Level",
      shopId: 3844,
      chainId: 0,
      software: "Tek",
    },
    {
      wowShopId: 1057,
      shopName: "Just-N-Tyme Automotive",
      shopId: 4400,
      chainId: 0,
      software: "Tek",
    },
    {
      wowShopId: 1055,
      shopName: "Ideal automative",
      shopId: 545,
      chainId: 0,
      software: "Tek",
    },
    {
      wowShopId: 1023,
      shopName: "Aero Auto Repair",
      shopId: 1159,
      chainId: 101,
      software: "Tek",
    },
    {
      wowShopId: 1024,
      shopName: "Aero Auto Repair",
      shopId: 1552,
      chainId: 101,
      software: "Tek",
    },
    {
      wowShopId: 1025,
      shopName: "Aero Auto Repair San Carlos",
      shopId: 3028,
      chainId: 101,
      software: "Tek",
    },
    {
      wowShopId: 1026,
      shopName: "Aero Auto Repair San Carlos",
      shopId: 3472,
      chainId: 101,
      software: "Tek",
    },
    // {
    //   wowShopId: 1028,
    //   shopName: "O'Bryan Auto Repair",
    //   shopId: 1692,
    //   chainId:102,
    //   software: "Tek"
    // },
    // {
    //   wowShopId: 1027,
    //   shopName: "O'Bryan Auto Repair",
    //   shopId: 331,
    //   chainId:102,
    //   software: "Tek"
    // },
    {
      wowShopId: 1029,
      shopName: "Matt's Automotive Service Center Pine City",
      shopId: 1873,
      chainId: 104,
      software: "Tek",
    },
    {
      wowShopId: 1030,
      shopName: "Matt's Automotive Service Center NOMO",
      shopId: 3539,
      chainId: 104,
      software: "Tek",
    },
    {
      wowShopId: 1031,
      shopName: "Matt's Automotive Service Center Fargo",
      shopId: 3540,
      chainId: 104,
      software: "Tek",
    },
    {
      wowShopId: 1032,
      shopName: "Matt's Automotive Service Center SOMO",
      shopId: 3541,
      chainId: 104,
      software: "Tek",
    },
    {
      wowShopId: 1033,
      shopName: "Matt's Automotive Service Center S Fago",
      shopId: 3542,
      chainId: 104,
      software: "Tek",
    },
    {
      wowShopId: 1034,
      shopName: "Matt's Automotive & Collision Center Collision",
      shopId: 3543,
      chainId: 104,
      software: "Tek",
    },
    {
      wowShopId: 1035,
      shopName: "Matt's Automotive Service Center Bloomington",
      shopId: 3547,
      chainId: 104,
      software: "Tek",
    },
    {
      wowShopId: 1036,
      shopName: "Matt's Automotive Service Center Columbia Heights",
      shopId: 3758,
      chainId: 104,
      software: "Tek",
    },
    {
      wowShopId: 1037,
      shopName: "Matt's Automotive Service Center Willmar",
      shopId: 3759,
      chainId: 104,
      software: "Tek",
    },
    {
      wowShopId: 1038,
      shopName: "Matt's Automotive Service Center North Branch",
      shopId: 3761,
      chainId: 104,
      software: "Tek",
    },
    {
      wowShopId: 1039,
      shopName: "Matt's Automotive Service Center North Branch",
      shopId: 293,
      chainId: 0,
      software: "Tek",
    },
    {
      wowShopId: 1040,
      shopName: "Matt's Automotive Service Center North Branch",
      shopId: 309,
      chainId: 0,
      software: "Tek",
    },
    {
      wowShopId: 1041,
      shopName: "Matt's Automotive Service Center North Branch",
      shopId: 398,
      chainId: 0,
      software: "Tek",
    },
    {
      wowShopId: 1042,
      shopName: "Matt's Automotive Service Center North Branch",
      shopId: 2305,
      chainId: 0,
      software: "Tek",
    },
    {
      wowShopId: 1043,
      shopName: "Matt's Automotive Service Center North Branch",
      shopId: 2442,
      chainId: 0,
      software: "Tek",
    },
    {
      wowShopId: 1044,
      shopName: "Matt's Automotive Service Center North Branch",
      shopId: 3229,
      chainId: 0,
      software: "Tek",
    },
    {
      wowShopId: 1045,
      shopName: "Matt's Automotive Service Center North Branch",
      shopId: 3351,
      chainId: 0,
      software: "Tek",
    },
    {
      wowShopId: 1046,
      shopName: "Matt's Automotive Service Center North Branch",
      shopId: 3385,
      chainId: 0,
      software: "Tek",
    },
    {
      wowShopId: 1047,
      shopName: "Matt's Automotive Service Center North Branch",
      shopId: 3520,
      chainId: 0,
      software: "Tek",
    },
    {
      wowShopId: 1048,
      shopName: "Matt's Automotive Service Center North Branch",
      shopId: 3586,
      chainId: 0,
      software: "Tek",
    },
    {
      wowShopId: 1049,
      shopName: "Matt's Automotive Service Center North Branch",
      shopId: 4120,
      chainId: 0,
      software: "Tek",
    },
    {
      wowShopId: 1050,
      shopName: "Matt's Automotive Service Center North Branch",
      shopId: 4494,
      chainId: 0,
      software: "Tek",
    },
    {
      wowShopId: 1051,
      shopName: "Matt's Automotive Service Center North Branch",
      shopId: 1216,
      chainId: 0,
      software: "Tek",
    },
    {
      wowShopId: 1052,
      shopName: "Matt's Automotive Service Center North Branch",
      shopId: 1398,
      chainId: 0,
      software: "Tek",
    },
    {
      wowShopId: 1053,
      shopName: "Matt's Automotive Service Center North Branch",
      shopId: 888,
      chainId: 0,
      software: "Tek",
    },
    {
      wowShopId: 1054,
      shopName: "Matt's Automotive Service Center North Branch",
      shopId: 4743,
      chainId: 0,
      software: "Tek",
    },
    {
      wowShopId: 1020,
      shopName: "Absolute Auto Repair Center - Shirley",
      shopId: 7029,
      chainId: 0,
      software: "Tek",
    },
    {
      wowShopId: 1021,
      shopName: "Absolute Auto Repair Center - Fitchburg",
      shopId: 7028,
      chainId: 0,
      software: "Tek",
    },
    {
      wowShopId: 1009,
      shopName: "Hal's Auto Care",
      shopId: 6906,
      chainId: 0,
      software: "Tek",
    }
  ],
  pro: [
    {
      wowShopId: 1017,
      shopName: "Sours  VA",
      fixedShopName: "Sours Automotive",
      shopId: "",
      chainId: 0,
      software: "pro",
    },
    {
      wowShopId: 1016,
      shopName: "AG Automotive - OR",
      fixedShopName: "AG Automotive",
      shopId: "",
      chainId: 0,
      software: "pro",
    },
    {
      wowShopId: 1018,
      shopName: "Highline – AZ",
      fixedShopName: "Highline Car Care",
      shopId: "",
      chainId: 0,
      software: "pro",
    },
    {
      wowShopId: 1013,
      shopName: "Toledo Autocare - B&L Whitehouse 3RD location",
      fixedShopName: "B&L Whitehouse Auto Service",
      shopId: "",
      chainId: 103,
      software: "pro",
    },
    {
      wowShopId: 1014,
      shopName: "Toledo Autocare - HEATHERDOWNS 2ND location",
      fixedShopName: "Toledo Auto Care",
      shopId: "",
      chainId: 103,
      software: "pro",
    },
    {
      wowShopId: 1015,
      shopName: "Toledo Autocare - Monroe Street 1ST location",
      fixedShopName: "Toledo Auto Care - Monroe",
      shopId: "",
      chainId: 103,
      software: "pro",
    },
  ],
  sw: [
    {
      wowShopId: 1079,
      shopName: "Car shop",
      shopId: 5257,
      tenantId: 4979,
      chainId: 0,
      software: "SW",
    },
    {
      wowShopId: 1019,
      shopName: "West St. Service Center",
      shopId: 5370,
      tenantId: 3065,
      chainId: 105,
      software: "SW",
    },
    {
      wowShopId: 1022,
      shopName: "Absolute Auto Repair Center - Fitchburg 2954",
      shopId: 4200,
      tenantId: 4186,
      chainId: 0,
      software: "SW",
    },
  ],
  mit: [
    {
      wowShopId: 1005,
      shopName: "Havasu Auto Care",
      shopId: "",
      chainId: 0,
      software: "mit",
    },
    {
      wowShopId: 1002,
      shopName: "Auto Service Special",
      shopId: "",
      chainId: 0,
      software: "mit",
    },
    {
      wowShopId: 1004,
      shopName: "Grand Garage",
      shopId: "",
      chainId: 0,
      software: "mit",
    },
    {
      wowShopId: 1001,
      shopName: "Advantage Auto Servi",
      shopId: "",
      chainId: 0,
      software: "mit",
    },
    {
      wowShopId: 1003,
      shopName: "Custom Automotive",
      shopId: "",
      chainId: 0,
      software: "mit",
    },
    {
      wowShopId: 1008,
      shopName: "Quality Auto",
      shopId: "",
      chainId: 0,
      software: "mit",
    },
    {
      wowShopId: 1007,
      shopName: "Olmsted Auto Care",
      shopId: "",
      chainId: 0,
      software: "mit",
    },
    {
      wowShopId: 1006,
      shopName: "Jenkins Auto",
      shopId: "",
      chainId: 0,
      software: "mit",
    },
    {
      wowShopId: 1056,
      shopName: "St. Joseph Auto",
      shopId: "",
      chainId: 0,
      software: "mit",
    },
  ],
  nap: [
    {
      wowShopId: 1010,
      shopName: "Steger",
      shopId: "",
      chainId: 0,
      software: "nap",
    },
    {
      wowShopId: 1011,
      shopName: "Velocity",
      shopId: "",
      chainId: 0,
      software: "nap",
    },
    {
      wowShopId: 1012,
      shopName: "Bryan",
      shopId: "",
      chainId: 0,
      software: "nap",
    },
  ],
};

const noProcessedShops = {
  tek: [],
  pro: [],
  sw: [],
  mit: [],
  nap: [],
};

@Injectable()
export class JobsService {
  readonly logger = new Logger(JobsService.name);

  constructor(
    private readonly tekService: TekService,
    private readonly tekJobService: TekmetricJobsService,
    private readonly tekCustomerService: TekmetricCustomerService,
    private readonly tekShopService: TekShopService,
    private readonly tekemployeeService: TekEmployeeService,
    private readonly swService: SwService,
    private readonly swCustomerService: SWCustomerService,
    private readonly swRepairOrderService: SWRepairOrderService,
    private readonly proService: ProService,
    private readonly proDataService: ProDataService,
    private readonly napService: NapService,
    private readonly mitService: MitService,
    private readonly listcleanupNameService: ListcleanupNameService,
    private readonly listcleanupAddressService: ListcleanupAddressService,
    private readonly listcleanupDedupeService: ListcleanupDedupeService,
    private readonly listcleanupService: ListcleanupService,
    private readonly bdayAppendService: BdayappendService,
    private readonly bdayWriteToDBService: BdayWriteToDBService,
    private readonly mailinglistCountsService: MailinglistCountsService,
    private readonly mailinglistMaxListService: MailinglistMaxListService,
    private readonly mailinglistSaveCSVService: MailinglistSaveCSVService,
    private readonly mailinglistGenerateService: MailinglistGenerateService,
    private readonly mailinglistWriteAccuzipToDBService: MailinglistWriteAccuzipToDBService,
    private readonly mailinglistService: MailinglistService,
    private readonly mailinglistGetValidCutomerService: MailinglistGetValidCustomerService,
    private readonly reportMailinglistService: ReportMailingListService,
    private readonly reportMDRService: ReportMDRService,
    private readonly reportSDRService: ReportSDRListService,
    private readonly reportService: ReportService,
    private readonly reportExportService: ReportExportService,
    private readonly extraService: ExtraService,
    private readonly extraMailingService: ExtraMailingService,
    private readonly updateDBService: UpdatedbService,
    private readonly accuzipWriteToDBService: AccuzipWriteToDBService,
    private readonly accuzipService: AccuzipService,
    private readonly accuzipOutputService: AccuzipOutputService,
    private readonly accuzipEnhandedService: AccuzipEnhandedService,
    private readonly bdayService: BdayService,
    private readonly accuzipReportService: AccuzipReportMailingService
  ) {
    this.runSyncJob = this.runSyncJob.bind(this);
    this.logException = this.logException.bind(this);
  }

  @Cron(new Date(Date.now() + 1 * 2000))
  //Runing hourly
  // @Cron("0 5-22 * * *", { timeZone: "America/Los_Angeles" })
  TEKMETRICtestJob() {
    return this.runSyncJob("Test Job", async () => {
      this.logger.log(`TEKMETRICTest job is executing... `);


      await this.accuzipOutputService.saveAllShopsMailingLists(5, 48)

      // await this.accuzipWriteToDBService.writeAccuzipOutputToDB('./accuzip_csv_files/cleanup-lists-1056-export.csv')
      // await this.accuzipWriteToDBService.writeAccuzipOutputToDB("./accuzip_csv_files/enhance/cleanup-lists-181-332-enhanced-export.csv");

      // console.log(res.filter(customer => customer.isMailable !== false));


      // await this.tekCustomerService.fetchAndWriteCustomers(1565);
      // await this.tekJobService.fetchAndWriteJobs(8495);

      // await this.reportMDRService.displayCleanupListsToSheet(allShops, 48)




      // await this.mailinglistWriteAccuzipToDBService.readAndWriteAccuzipCustomers();

      // await this.extraService.readAccuzipInfor();

      // await this.extraService.writeRCPASToDB();

      // let wsidArr: string [] = [];
      // for (let customer of res) {
      //   let wsid = customer?.WSID ?? "";
      //   if (wsid in wsidArr) {
      //     continue;
      //   } else  {
      //     wsidArr.push(wsid);
      //     console.log(wsid);
      //   }
        
      // }

  //     const res = await this.extraService.reasMattShops("./Mailing Lists 4 - 2024/1029-Matt_s Automotive Service Center Pine City-BDayList 4-105.csv")


  //     async function findDuplicates(array: any []) {
  //       const duplicates: any [] = [];
  //       const uniqueElements = new Set();
    
  //       array.forEach(element => {
  //           const key = `${element.First}-${element.Last}-${element.Address}`;
  //           if (uniqueElements.has(key)) {
  //               duplicates.push(element);
  //           } else {
  //               uniqueElements.add(key);
  //           }
  //       });
    
  //       return duplicates;
  //     }

  //     const duplicatedElements = await findDuplicates(res);
  // console.log(duplicatedElements.length);

      // await this.listcleanupService.exportMailingListCSV(allShops, 48, false);
      // await this.reportMDRService.updatedDB(allShops);
      // await this.reportMDRService.displayCleanupListsToSheet(allShops, 48)
      //////////write the all bday to accuzip customers ///////////

      // await this.bdayWriteToDBService.writeAllBdayToAccuzipCustomer('./bday_append_output/BdayInput-2024-03_Final.csv');

      //////////write the bday append input file ////

      // await this.bdayAppendService.saveBdayInputFile("./accuzip_csv_files/cleanup-lists-2024-03-export.csv", "./accuzip_csv_files/st joseph auto processed.csv", "./accuzip_csv_files/Shop_position.csv")

      // await this.bdayWriteToDBService.wrtieU60BdayToDB();
      ///////////wrtie the accuzip out put files to db //////////
      ////////////////////////////

      // await this.reportMDRService.displayCleanupListsToSheet(allShops);


      ////////////////////// clean up listing~~~~~~~~~~~~~~~
      // let date60MosAgo = new Date();
      // let date48MosAgo = new Date();
      // date60MosAgo.setMonth(date60MosAgo.getMonth() - 60);
      // date48MosAgo.setMonth(date48MosAgo.getMonth() - 48);
      // const cleanupLists = await this.reportMDRService.getCleanupLists(
      //   allShops,
      //   date48MosAgo,
      // );

      // let customers: any[] = [];

      // Object.entries(cleanupLists).map(([wowShopId, count]) => {
      //   // if (
      //   //   Number(wowShopId) < 5005 &&
      //   //   Number(wowShopId) !== 1057 &&
      //   //   Number(wowShopId) !== 1049
      //   // ) {
      //   //   customers = [
      //   //     ...customers,
      //   //     ...count.u48ValidCustomers,
      //   //     ...count.o48ValidCustomers.filter(
      //   //       (customer) => new Date(customer.strAuthDate) >= date60MosAgo,
      //   //     ),
      //   //   ];
      //   // }
      //   // else {
      //   //   customers = [
      //   //     ...customers,
      //   //     ...count.u48ValidCustomers,
      //   //     // ...count.o48ValidCustomers,
      //   //   ];
      //   // }


      //   customers = [
      //     ...customers,
      //     ...count.u48ValidCustomers,
      //     ...count.o48ValidCustomers
      //   ]

        
      //   // if (count.u48ValidCustomers.length > 1800) {
      //     //   customers = [...customers, ...count.u48ValidCustomers];
      //     // } else {
      //       //   customers = [
      //         //     ...customers,
      //         //     ...count.u48ValidCustomers,
      //         //     ...count.o48ValidCustomers
      //         //       .sort((a, b) => b.authDate - a.authDate)
      //         //       .slice(0, 1800 - count.u48ValidCustomers.length),
      //         //   ];
      //         // }
      // });
            
      // await this.reportExportService.exportValidCustomers(customers);


      ///////////////fetching the customers of tekmetric shops ///////////

      // await this.tekShopService.fetchAndWriteShops();
      /////////////over or under 48 valid customers ////////////

      // await this.reportMDRService.displayCleanupListsToSheet(allShops);

      //////////////stored the customers //////////////////////

      // await this.tekCustomerService.fetchAndWriteCustomers(5055);

      // await this.tekJobService.fetchAndWriteJobs(5055);

      ///////////////////1045 good customers/////////////////

      // const res1 = await this.listcleanupDedupeService.dedupeCustomers(
      //   allShops,
      //   48,
      //   true,
      // );

      // const goodCustomers = res1.filter((c) => c.wowShopId === 1045);

      // const validCustomers = await this.tekService.read1045AccuzipCustomers();
      // const birthdays = await this.tekService.read1045GoodCusotmers();

      // goodCustomers.forEach((c) => {
      //   if (c.bmonth.trim() === "") {
      //     const bday = validCustomers.find(
      //       (customer) => customer.id == c.id + c.wowShopId,
      //     );
      //     c.bmonth = bday ? bday.mbdaymo : "";
      //     c.byear = bday ? bday.mbdayyr : "";
      //   }
      // });

      // const newCustomers = goodCustomers.map((c) => {
      //   const bday = birthdays.find((customer) => customer.id == c.id);

      //   return {
      //     ...c,
      //     sdbday:
      //       bday !== null
      //         ? bday.bday
      //           ? new Date(bday.bday).toISOString().split("T")[0]
      //           : ""
      //         : "",
      //   };
      // });

      // await this.reportExportService.export1045shop(newCustomers);

      // await this.bdayWriteToDBService.writeAllBdayToAccuzipCustomer(
      //   "./bday_append_output/BdayInput-231214 - 32,004_Final.csv",
      // );
      // await this.mailinglistService.validNoBdayCustomers();

      // await this.tekShopService.fetchAndWriteShops();

      // await this.mailinglistWriteAccuzipToDBService.readAndWriteAccuzipCustomejobserrs();
      // await this.reportMDRService.displayCleanupListsToSheet(allShops);

      // await this.reportExportService.exportValidCustomers(allShops);

      // await this.reportMDRService.updatedDB(allShops);

      // const res = await this.listcleanupDedupeService.dedupeCustomers(
      //   allShops,
      //   48,
      //   false,
      // );

      // console.log(
      //   res.filter(
      //     (c) =>
      //       c.wowShopId == 5005 &&
      //       c.isBadAddress !== "Bad Address" &&
      //       c.isDuplicate !== "Duplicate" &&
      //       c.nameCode !== "Bad Name",
      //   ).length,
      // );
      // console.log(
      //   res.filter(
      //     (c) =>
      //       c.wowShopId == 5006 &&
      //       c.isBadAddress !== "Bad Address" &&
      //       c.isDuplicate !== "Duplicate" &&
      //       c.nameCode !== "Bad Name",
      //   ).length,
      // );
      // console.log(
      //   res.filter(
      //     (c) =>
      //       c.wowShopId == 5007 &&
      //       c.isBadAddress !== "Bad Address" &&
      //       c.isDuplicate !== "Duplicate" &&
      //       c.nameCode !== "Bad Name",
      //   ).length,
      // );

      // await this.reportExportService.exportValidCustomers(allShops);

      // await this.reportMDRService.displayCleanupListsToSheet(allShops);

      // await this.reportMDRService.updatedDB(allShops);
//``````````````````````````````````````Showing all months mailing lists ````````````````
      // const res = await this.reportMailinglistService.calculateCountsPerShop(
      //   "./accuzip_csv_files/st joseph auto processed.csv",
      //   "./accuzip_csv_files/Shop_position.csv",
      //   "./max_lists/count.csv",
      // );

      // // // // // // // await this.reportMDRService.displayCleanupListsToSheet(allShops);

      // await this.reportMailinglistService.appendCountsPerShop(res);
// ````````````````````````````````````mAILING LISTS````````````````````````````````
      // await this.mailinglistSaveCSVService.createWholeShopsCSV(
      //   "./accuzip_csv_files/st joseph auto processed.csv",
      //   "./accuzip_csv_files/Shop_position.csv",
      //   "./max_lists/count.csv",
      //   4,
      // );
//````````````````````````````````````````````````````````````````````````````````

      // await this.reportExportService.exportValidCustomers(allShops);

      // await this.mailinglistWriteAccuzipToDBService.readAndWriteAccuzipCustomers();
      //
      // await this.reportMDRService.displayCleanupListsToSheet(allShops);

      // const res = await this.reportService.getSheetData(
      //   "1H-eGee5K6sNmdPhuld2lT6c_hgWhHxFCQuHiTfc17ag",
      //   "Sheet1",
      // );

      // await this.reportMDRService.updatedDB(noProcessedShops);
      // const res =
      //   await this.mailinglistGetValidCutomerService.getAccuzipCustomers();

      // const res = await this.mailinglistGetValidCutomerService.getTekBdays();

      // console.log(res);

      // await this.reportExportService.exportValidCustomers(allShops);

      // await this.listcleanupService.exportMailingListCSV(
      //   allShops,
      //   48,
      //   true,
      // );

      // await this.listcleanupService.exportMailingListCSV(
      //   allShops,
      //   48,
      //   true,
      // );

      // await this.mailinglistWriteAccuzipToDBService.readAndWriteAccuzipCustomers();
      // await this.bdayWriteToDBService.writeSWBdayToDB();

      // await this.bdayWriteToDBService.writeMitBdayToDB();

      // await this.bdayWriteToDBService.writeTekBdayToDB();

      // await this.reportExportService.exportValidCustomers(allShops);

      // await this.mailinglistService.getValidCustomers();

      // await this.tekShopService.fetchAndWriteShops();

      // await this.mailinglistWriteAccuzipToDBService.readAndWriteAccuzipCustomers();

      // await this.reportMDRService.updatedDB(allShops);

      // await this.swCustomerService.fetchAndWriteCustomers(3065);

      // await this.tekShopService.fetchAndWriteShops();

      // await this.listcleanupService.exportMailingListCSV(allShops, 48, true);

      // await this.listcleanupService.exportMailingListCSV(allShops, 48, true);
      // const shops = [3826, 3828, 5519];

      // await this.mailinglistWriteAccuzipToDBService.readAndWriteAccuzipCustomers();

      // await this.tekShopService.fetchAndWriteShops();

      // const res = await this.listcleanupDedupeService.dedupeCustomers(
      //   allShops,
      //   48,
      //   true,
      // );

      // console.log(
      //   res.filter(
      //     (c) =>
      //       c.isBadAddress !== "Bad Address" &&
      //       c.nameCode !== "Bad Name" &&
      //       c.isDuplicate !== "Duplicate" &&
      //       c.wowShopId === 1064,
      //   ).length,
      // );

      // const res = await this.proService.fetchCustomers("Toledo Autocare - B&L Whitehouse 3RD location", "", 1015, 0, "", 48)

      // console.log(res.filter(customer => customer.id === '1c1bdc42-bb71-434c-b07c-b90c1bf8360b'));

      // await this.listcleanupService.exportMailingListCSV(allShops, 20000);

      // await this.mailinglistWriteAccuzipToDBService.readAccuzipCustomers()

      // await this.reportMDRService.displayCleanupListsToSheet(allShops)

      // await this.tekShopService.fetchAndWriteShops()

      // await this.tekJobService.fetchAndWriteJobs(383)

      // const res = await this.listcleanupDedupeService.dedupeCustomers(allShops, 24276);

      // console.log(res.filter(customer => customer.wowShopId === 1062 && customer.isDuplicate !== "Duplicate" && customer.isBadAddress !== "Bad Address" && customer.nameCode !== "Bad Name").length)

      // await this.tekShopService.fetchAndWriteShops();

      // await this.tekJobService.fetchAndWriteJobs(3045);

      // console.log(res.length)

      // await this.mailinglistWriteAccuzipToDBService.readAccuzipCustomers()
      // await this.mailinglistWriteAccuzipToDBService.readAndWriteAccuzipCustomers()
    });
  }

  @Cron("0 0,3,6,21 * * *", {
    timeZone: "America/New_York", // specifying Eastern Time Zone
  })
  UPDATEDBDailyJob() {
    return this.runSyncJob("Test Job", async () => {
      this.logger.log(`ProtractorTest job is executing...`);
      console.log(new Date());

      // await this.reportMDRService.updatedDB(allShops);
    });
  }

  async runSyncJob(name: string, func: () => Promise<void>) {
    this.logger.log(`START ${name}...`);
    await func();
    this.logger.log(`END ${name}...`);
  }

  logException(ex: unknown) {
    if (typeof ex === "object" && ex !== null && "message" in ex) {
      const err = ex as Error;
      this.logger.error(err.message, err.stack);
    } else {
      this.logger.error(ex);
    }
  }
}
