import { Injectable } from "@nestjs/common";
import { allShopObject } from "../listcleanup/listcleanup.dedupe.service";
// import { ReportMDRService } from "./report.mdr.service";
const csvWriter = require("csv-writer");
import path from "path";

@Injectable()
export class ReportExportService {
  constructor( 
    // private readonly reportMDRService: ReportMDRService,
  ) {}

  async exportValidCustomers(customers: any[]) {

    console.log(customers[0])
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
    //   if (
    //     Number(wowShopId) < 5005 &&
    //     Number(wowShopId) !== 1057 &&
    //     Number(wowShopId) !== 1049
    //   ) {
    //     customers = [
    //       ...customers,
    //       ...count.u48ValidCustomers,
    //       ...count.o48ValidCustomers.filter(
    //         (customer) => new Date(customer.strAuthDate) >= date60MosAgo,
    //       ),
    //     ];
    //   }
    //   // else if (Number(wowShopId) === 1049) {
    //   //   customers = [...customers, ...count.o48ValidCustomers];
    //   // }
    //   else {
    //     customers = [
    //       ...customers,
    //       ...count.u48ValidCustomers,
    //       ...count.o48ValidCustomers,
    //     ];
    //   }

    //   // if (count.u48ValidCustomers.length > 1800) {
    //   //   customers = [...customers, ...count.u48ValidCustomers];
    //   // } else {
    //   //   customers = [
    //   //     ...customers,
    //   //     ...count.u48ValidCustomers,
    //   //     ...count.o48ValidCustomers
    //   //       .sort((a, b) => b.authDate - a.authDate)
    //   //       .slice(0, 1800 - count.u48ValidCustomers.length),
    //   //   ];
    //   // }
    // });

    // const noBdayCustomers = customers.filter((c) => c.byear.trim() === "");

    const writer = csvWriter.createObjectCsvWriter({
      path: path.resolve(__dirname, `./csv/cleanup-lists-2024-03.csv`),
      header: [
        { id: "wowShopId", title: "WSID" },
        { id: "WCAID", title: "WCID" },
        { id: "chainId", title: "WCAID" },
        { id: "software", title: "Software" },
        { id: "shopId", title: "SID" },
        { id: "id", title: "CID" },
        { id: "shopName", title: "Shop Name" },
        { id: "strAuthDate", title: "AuthDate" },
        { id: "byear", title: "MBDayYr" },
        { id: "bmonth", title: "MBDayMo" },
        { id: "TBDayMo", title: "TBDayMo" },
        { id: "oldFirstName", title: "Old First" },
        { id: "oldLastName", title: "Old Last" },
        { id: "newFirstName", title: "First" },
        { id: "newLastName", title: "Last" },
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

  async mailinigCustomers(customers: any[]) {
    const rawCustomers = customers.sort(
      (a: any, b: any) => a.distance - b.distance,
    ).filter(customer => Number(customer.mbdaymo) < 1);

    console.log(rawCustomers[0])
    console.log('~~~~~~~~~~~~~~~~~~~~', rawCustomers.length)

    // const newCustomers = rawCustomers.filter(c => Number(c.mbdaymo?.trim() ?? '0') === 0);

    const writer = csvWriter.createObjectCsvWriter({
      path: path.resolve(__dirname, "./csv/accuzip_inputfile_5017.csv"),
      header: [
        { id: "shopname", title: "Shop Name" },
        { id: "wsid", title: "WSID" },
        { id: "authdate", title: "Last AuthDate" },
        { id: "id", title: "Customer Id" },
        { id: "firstname", title: "First" },
        { id: "lastname", title: "Last" },
        { id: "mbdayyr", title: "MBdayyr" },
        { id: "mbdaymo", title: "MBdaymo" },
        { id: "address", title: "Address" },
        { id: "city", title: "City" },
        { id: "state", title: "St" },
        { id: "zip", title: "Zip" },
      ],
    });

    await writer.writeRecords(rawCustomers).then(() => {
      console.log("Done!");
    });
  }

  async export1045shop(customers: any[]) {
    const newCustomers = customers.filter(
      (c) =>
        c.isBadAddress !== "Bad Address" &&
        c.isDuplicate !== "Duplicate" &&
        c.nameCode !== "Bad Name",
    );

    const writer = csvWriter.createObjectCsvWriter({
      path: path.resolve(__dirname, "./csv/bday-1045.csv"),
      header: [
        { id: "shopName", title: "Shop Name" },
        { id: "newFirstName", title: "First Name" },
        { id: "newLastName", title: "Last Name" },
        { id: "id", title: "CustomerId" },
        { id: "byear", title: "MBdayyr" },
        { id: "bmonth", title: "MBmonth" },
        { id: "address", title: "Address" },
        { id: "address2", title: "Address2" },
        { id: "city", title: "City" },
        { id: "state", title: "State" },
        { id: "zip", title: "Zip" },
        { id: "strAuthDate", title: "AuthDate" },
        { id: "sdbday", title: "Sdbday" },
      ],
    });

    await writer.writeRecords(newCustomers).then(() => {
      console.log("Done!");
    });
  }
}
