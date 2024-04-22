import { Injectable } from "@nestjs/common";
const csvWriter = require("csv-writer");
import path from "path";
import * as fs from "fs";
import { MailinglistCountsService } from "./mailinglist.counts.service";
import { MailinglistGenerateService } from "./mailinglist.generate.service";
import { MailinglistService } from "./mailinglist.service";

@Injectable()
export class MailinglistSaveCSVService {
  constructor(
    private readonly mailinglistCountService: MailinglistCountsService,
    private readonly mailinglistGenerateService: MailinglistGenerateService,
    private readonly mailinglistService: MailinglistService,
  ) {}

  async mailinigCustomers(stPath: string, storePath: string) {
    const customers = await this.mailinglistCountService.dedupe(
      stPath,
      storePath,
    );

    // const newCustomers = customers.filter(
    //   (c) =>
    //     c.wsid == "1023" ||
    //     c.wsid == "1024" ||
    //     c.wsid == "1025" ||
    //     c.wsid == "1026",
    // );

    const writer = csvWriter.createObjectCsvWriter({
      path: path.resolve(__dirname, "./mailinglist/mailingCustomers.csv"),
      header: [
        { id: "shopname", title: "Shop Name" },
        { id: "software", title: "Software" },
        { id: "shopId", title: "SID" },
        { id: "customerId", title: "CID" },
        { id: "wcId", title: "WCID" },
        { id: "wsId", title: "WSID" },
        { id: "wcaId", title: "WCAID" },
        { id: "authdate", title: "Last AuthDate" },
        { id: "latitude", title: "Latitude" },
        { id: "logitude", title: "Longitude" },
        { id: "distance", title: "Distance" },
        { id: "isMailable", title: "IsMailable" },
        { id: "mbdayyr", title: "MBdayYr" },
        { id: "mbdaymo", title: "MBdayMo" },
        { id: "tbdaymo", title: "TBdayMo" },
        { id: "firstName", title: "First" },
        { id: "lastName", title: "Last" },
        { id: "address", title: "Address" },
        { id: "address2", title: "Address2" },
        { id: "city", title: "City" },
        { id: "state", title: "St" },
        { id: "zip", title: "Zip" },
      ],
    });

    await writer.writeRecords(customers).then(() => {
      console.log("Done!");
    });
  }

  async saveMailinglist() {
    // async saveMailinglist(stPath: string, storePath: string) {
    // const customers = await this.mailinglistCountService.assignTBday(
    //   stPath,
    //   storePath,
    // );

    const customers = await this.mailinglistService.validCustomer();

    const writer = csvWriter.createObjectCsvWriter({
      path: path.resolve(__dirname, "./mailinglist/valid_customers_1049.csv"),
      header: [
        { id: "shopname", title: "Shop Name" },
        { id: "software", title: "Software" },
        { id: "shopId", title: "SID" },
        { id: "customerId", title: "CID" },
        { id: "wcId", title: "WCID" },
        { id: "wsId", title: "WSID" },
        { id: "wcaId", title: "WCAID" },
        { id: "authdate", title: "Last AuthDate" },
        // { id: "mbdayyr", title: "MBdayYr" },
        // { id: "mbdaymo", title: "MBdayMo" },
        // { id: "tbdaymo", title: "TBdayMo" },
        { id: "firstName", title: "First" },
        { id: "lastName", title: "Last" },
        { id: "address", title: "Address" },
        { id: "address2", title: "Address2" },
        { id: "city", title: "City" },
        { id: "state", title: "St" },
        { id: "zip", title: "Zip" },
        { id: "distance", title: "Distance" },
      ],
    });

    await writer.writeRecords(customers).then(() => {
      console.log("Done!");
    });
  }

  async saveMailinglistForMon(
    stPath: string,
    storePath: string,
    limitPath: string,
    mo: number,
  ) {
    const customers =
      await this.mailinglistGenerateService.generateMailingLists(
        stPath,
        storePath,
        limitPath,
        mo,
      );

    const writer = csvWriter.createObjectCsvWriter({
      path: path.resolve(__dirname, "./mailinglist/mailing_list_thismon.csv"),
      header: [
        { id: "shopname", title: "Shop Name" },
        { id: "software", title: "Software" },
        { id: "shopId", title: "SID" },
        { id: "customerId", title: "CID" },
        { id: "wcId", title: "WCID" },
        { id: "wsId", title: "WSID" },
        { id: "wcaId", title: "WCAID" },
        { id: "authdate", title: "Last AuthDate" },
        { id: "mbdayyr", title: "MBdayYr" },
        { id: "mbdaymo", title: "MBdayMo" },
        { id: "tbdaymo", title: "TBdayMo" },
        { id: "firstName", title: "First" },
        { id: "lastName", title: "Last" },
        { id: "address", title: "Address" },
        { id: "address2", title: "Address2" },
        { id: "city", title: "City" },
        { id: "state", title: "St" },
        { id: "zip", title: "Zip" },
      ],
    });

    await writer.writeRecords(customers).then(() => {
      console.log("Done!");
    });
  }

  async saveTBdaylist(stPath: string, storePath: string) {
    const customers = await this.mailinglistCountService.assignTBday(
      stPath,
      storePath,
    );

    const writer = csvWriter.createObjectCsvWriter({
      path: path.resolve(__dirname, "./mailinglist/tbday_list.csv"),
      header: [
        { id: "id", title: "Shop Id" },
        { id: "mbdaymo", title: "BirthDay Month" },
        { id: "bdaymo", title: "BDay Counts" },
        { id: "tbdaymo", title: "TDay Counts" },
        { id: "all", title: "All Counts" },
      ],
    });

    await writer.writeRecords(customers).then(() => {
      console.log("Done!");
    });
  }

  async saveMailingListsPerShop(customers: any[], filename: string) {
    const writer = csvWriter.createObjectCsvWriter({
      path: path.resolve(__dirname, `./mailinglistpershop/${filename}.csv`),
      header: [
        { id: "shopname", title: "Shop Name" },
        { id: "software", title: "Software" },
        { id: "shopId", title: "SID" },
        { id: "customerId", title: "CID" },
        { id: "wcId", title: "WCID" },
        { id: "wsId", title: "WSID" },
        { id: "wcaId", title: "WCAID" },
        { id: "authdate", title: "Last AuthDate" },
        { id: "mbdayyr", title: "MBdayYr" },
        { id: "mbdaymo", title: "MBdayMo" },
        { id: "tbdaymo", title: "TBdayMo" },
        { id: "firstName", title: "First" },
        { id: "lastName", title: "Last" },
        { id: "address", title: "Address" },
        { id: "address2", title: "Address2" },
        { id: "city", title: "City" },
        { id: "state", title: "St" },
        { id: "zip", title: "Zip" },
      ],
    });

    await writer.writeRecords(customers).then(() => {
      console.log("Done!");
    });
  }

  async createWholeShopsCSV(
    stPath: string,
    storePath: string,
    limitPath: string,
    mo: number,
  ) {
    const customers =
      await this.mailinglistGenerateService.generateMailingListsPerShop(
        stPath,
        storePath,
        limitPath,
        mo,
      );

    customers.map(customer => {
      console.log(customer.filter(c => c.isDuplicate != "").length)
    })

    await Promise.all(
      customers.map((item) =>
        this.saveMailingListsPerShop(
          item,
          `${item[0].wsId}-${item[0].shopname}-${item[0].ListName}-${item.length}`,
        ),
      ),
    );
  }
}
