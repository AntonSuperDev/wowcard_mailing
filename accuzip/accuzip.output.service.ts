import { Inject, Injectable } from "@nestjs/common";
import * as fs from "fs";
import csv from "csv-parser";
import { Pool } from "pg";
const csvWriter = require("csv-writer");
import path from "path";
import { AccuzipService } from "./accuzip.service";

@Injectable()
export class AccuzipOutputService {
    constructor(
        private readonly accuzipService: AccuzipService,
        @Inject("DB_CONNECTION") private readonly db: Pool
    ) {}

    async saveMailinglist(dateAgo: number, isLimitedAuthdate: boolean, isUnder: boolean) {
      const validCustomers = await this.accuzipService.limitMiles(dateAgo, isLimitedAuthdate, isUnder);
      const writer = csvWriter.createObjectCsvWriter({
        path: path.resolve(__dirname, "./mailinglist/mailing-lists-o48.csv"),
        header: [
          { id: "shopName", title: "Shop Name" },
          { id: "software", title: "Software" },
          { id: "shopId", title: "SID" },
          { id: "id", title: "CID" },
          { id: "wsId", title: "WSID" },
          { id: "wcaId", title: "WCAID" },
          { id: "strAuthDate", title: "Last AuthDate" },
          { id: "firstName", title: "First" },
          { id: "lastName", title: "Last" },
          { id: "address", title: "Address" },
          { id: "city", title: "City" },
          { id: "state", title: "St" },
          { id: "zip", title: "Zip" },
        ],
      });
  
      await writer.writeRecords(validCustomers).then(() => {
        console.log("Done!");
      });
    }

    async saveAllShopsMailingLists(month: number, dateAgo: number) {
      const customers = await this.accuzipService.generateMailingListsPerShop(month, dateAgo);
      await Promise.all(
        customers.map(item => 
          this.saveEachShopMailingLists(
            item,
            `${item[0].wsId}-${item[0].shopName}-${item[0].ListName}-${item.length}`,
          )
        )
      )
    }

    async saveEachShopMailingLists(customers: any[], fileName: string) {
      const writer = csvWriter.createObjectCsvWriter({
        path: path.resolve(__dirname, `./mailinglistpershop/${fileName}.csv`),
        header: [
          { id: "shopName", title: "Shop Name" },
          { id: "software", title: "Software" },
          { id: "shopId", title: "SID" },
          { id: "id", title: "CID" },
          { id: "wsId", title: "WSID" },
          { id: "wcaId", title: "WCAID" },
          { id: "strAuthDate", title: "Last AuthDate" },
          { id: "mbdayyr", title: "MBdayYr" },
          { id: "mbdaymo", title: "MBdayMo" },
          { id: "tbdaymo", title: "TBdayMo" },
          { id: "firstName", title: "First" },
          { id: "lastName", title: "Last" },
          { id: "address", title: "Address" },
          { id: "city", title: "City" },
          { id: "state", title: "St" },
          { id: "zip", title: "Zip" },
        ],
      });
  
      await writer.writeRecords(customers).then(() => {
        console.log("Done!");
      });
    }
}
