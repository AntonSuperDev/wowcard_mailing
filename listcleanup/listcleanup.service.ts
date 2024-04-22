import { Injectable } from "@nestjs/common";
import { allShopObject } from "./listcleanup.dedupe.service";
import { ListcleanupDedupeService } from "./listcleanup.dedupe.service";

const csvWriter = require("csv-writer");
import path from "path";

@Injectable()
export class ListcleanupService {
  constructor(
    private readonly listcleanupDedupeService: ListcleanupDedupeService,
  ) {}

  async exportCountsCSV(
    allShops: allShopObject,
    period: number,
    isAll: boolean,
  ) {
    const counts = await this.listcleanupDedupeService.count(
      allShops,
      period,
      isAll,
    );

    const writer = csvWriter.createObjectCsvWriter({
      path: path.resolve(__dirname, "./csv/counts 11 (new).csv"),
      header: [
        { id: "id", title: "WSID" },
        { id: "shopName", title: "Shopname" },
        { id: "software", title: "Software" },
        { id: "bd", title: "BDaycounts" },
        { id: "hd", title: "HDaycounts" },
        { id: "td", title: "TDaycounts" },
      ],
    });

    await writer.writeRecords(counts).then(() => {
      console.log("Done!");
    });
  }

  async exportMailingListCSV(
    allShops: allShopObject,
    period: number,
    isAll: boolean,
  ) {
    let customers = await this.listcleanupDedupeService.dedupeCustomers(
      allShops,
      period,
      isAll,
    );

    customers = customers.filter(
      (item) =>
        item.isBadAddress !== "Bad Address" &&
        item.isDuplicate !== "Duplicate" &&
        item.nameCode !== "Bad Name" && (
          item.wowShopId === 5017
        ),
    );

    const writer = csvWriter.createObjectCsvWriter({
      path: path.resolve(__dirname, `./csv/cleanup-lists-(5017).csv`),
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
}
