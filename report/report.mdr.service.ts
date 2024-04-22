import { Injectable, Inject } from "@nestjs/common";
import { allShopObject } from "../listcleanup/listcleanup.dedupe.service";
import { ListcleanupDedupeService } from "../listcleanup/listcleanup.dedupe.service";
import { TekmetricCustomerObject } from "../tek/tek.api.getcustomers.service";
import { TekmetricJobObject } from "../tek/tek.api.getjobs.service";
import { TekmetricApiService } from "../tek/api.service";
import { TekmetricCustomerService } from "../tek/tek.api.getcustomers.service";
import { TekmetricJobsService } from "../tek/tek.api.getjobs.service";
import { ProDataService } from "../pro/pro.api.getdata.service";
import { SWDataCustomer } from "../sw/sw.api.getcustomers.service";
import { SWCustomerObject } from "../sw/sw.api.getcustomers.service";
import { SWDataRepairorder } from "../sw/sw.api.getrepairorders.service";
import { SWRepairOrderObject } from "../sw/sw.api.getrepairorders.service";
import { SWApiService } from "../sw/api.service";
import { SWCustomerService } from "../sw/sw.api.getcustomers.service";
import { SWRepairOrderService } from "../sw/sw.api.getrepairorders.service";
import { ReportService } from "./report.service";
import { Pool } from "pg";
import { BdayAppendDistanceService } from "../bdayappend/bdayappend.distance.service";
import { BdayappendService } from "../bdayappend/bdayappend.service";
import { ReportExportService } from "./report.export.validc";

const protractorShops = [
  {
    apiKey: "9410fa3e72874f01b433f1025d9c03a6",
    id: "1614ec5b5c234361976ae718729a9119",
    shopName: "AG Automotive - OR",
  },
  {
    apiKey: "bec8dcdf55bb486282949b18aa530ae6",
    id: "6962e4ee2c0a4d189f4c521270c80a7b",
    shopName: "Highline – AZ",
  },
  {
    apiKey: "a65016d78b6c4eaca303bb78fdf97a66",
  id: "2bb37cdd6a1f40e893f27ee1cc7edb0a",
  shopName: "Toledo Autocare - B&L Whitehouse 3RD location",
  },
  {
    apiKey: "dd97566d7f44411e8f851c064e62c923",
    id: "3d5591b2efc94b73b7daac6525004764",
    shopName: "Toledo Autocare - Monroe Street 1ST location",
  },
  {
    apiKey: "c591bce054604c2a9eb903bd6b4b694e",
    id: "aad3590f79ac44aca4f16dc7cb1afedb",
    shopName: "Toledo Autocare - HEATHERDOWNS 2ND location",
  },
  {
    apiKey: "81ac6ecfd69d4cae9a26fe21073aa5fc",
    id: "3ed20563cfe8473f98c9ffa72870d327",
    shopName: "Sours  VA",
  },
];

type customerCounts = {
  validCustomersUnder48: number;
  noValidCustomersUnder48: number;
  validCustomersOver48: number;
  noValidCustomersOver48: number;
  u48ValidCustomers: any[];
  o48ValidCustomers: any[];
  shopName: string;
  software: string;
};

@Injectable()
export class ReportMDRService {
  constructor(
    private readonly listcleanupDedupeService: ListcleanupDedupeService,
    private readonly tekmetricApiService: TekmetricApiService,
    private readonly tekmetricCustomerService: TekmetricCustomerService,
    private readonly tekmetricJobsService: TekmetricJobsService,
    private readonly proDateService: ProDataService,
    private readonly swApiService: SWApiService,
    private readonly swCustomerService: SWCustomerService,
    private readonly swRepairOrderService: SWRepairOrderService,
    private readonly reportService: ReportService,
    private readonly bdayappendDistanceSErvice: BdayAppendDistanceService,
    private readonly bdayappendService: BdayappendService,
    private readonly exportMalingCustomers: ReportExportService,
    @Inject("DB_CONNECTION") private readonly db: Pool,
  ) {}

  async displayCleanupListsToSheet(allShops: allShopObject, month: number) {
    let date48MosAgo = new Date();
    date48MosAgo.setMonth(date48MosAgo.getMonth() - month);
    const spreadSheetId = "1H-eGee5K6sNmdPhuld2lT6c_hgWhHxFCQuHiTfc17ag";
    const cleanupLists = await this.getCleanupLists(allShops, date48MosAgo);
    const noCleanupLists = await this.listcleanupDedupeService.dedupeCustomers(
      allShops,
      month,
      true,
    );

    // const accuzipRecords = await this.db.query(
    //   `SELECT
    //       accuzip.id AS id,
    //       accuzip.wsid AS wsid,
    //       accuzip.shopname AS shopname,
    //       accuzip.firstname AS firstname,
    //       accuzip.lastname AS lastname,
    //       accuzip.mbdayyr AS mbdayyr,
    //       accuzip.mbdaymo AS mbdaymo,
    //       accuzip.address AS address,
    //       accuzip.city AS city,
    //       accuzip.state AS state,
    //       accuzip.zip AS zip,
    //       accuzip.authdate AS authdate,
    //       accuzip.status_ AS status,
    //       accuzip.latitude_ AS latitude,
    //       accuzip.logitude_ AS logitude,
    //       tekcustomer8.phone1 AS phone
    //   FROM accuzipcustomer AS accuzip
    //   LEFT JOIN tekcustomer8 ON CONCAT(tekcustomer8.id, '1049') = accuzip.id;`,
    // );

    const accuzipRecords = await this.db.query(
      `SELECT
          accuzip.id AS id,
          accuzip.wsid AS wsid,
          accuzip.shopname AS shopname,
          accuzip.firstname AS firstname,
          accuzip.lastname AS lastname,
          accuzip.mbdayyr AS mbdayyr,
          accuzip.mbdaymo AS mbdaymo,
          accuzip.address AS address,
          accuzip.city AS city,
          accuzip.state AS state,
          accuzip.zip AS zip,
          accuzip.authdate AS authdate,
          accuzip.status_ AS status,
          accuzip.latitude_ AS latitude,
          accuzip.logitude_ AS logitude,
          accuzip.email AS email,
          accuzip.phone AS phone
      FROM accuzipcustomer AS accuzip`
    );

    const accuzipCustomers = accuzipRecords.rows.map((customer) => {

      return {
        id: customer.id,
        wsid: customer.wsid,
        shopname: customer.shopname,
        firstname: customer.firstname,
        lastname: customer.lastname,
        mbdayyr: customer.mbdayyr,
        mbdaymo: customer.mbdaymo,
        address: customer.address,
        city: customer.city,
        state: customer.state,
        zip: customer.zip,
        authdate: new Date(customer.authdate),
        status: customer.status,
        latitude: customer.latitude,
        logitude: customer.logitude,
        phoneNumber: customer.phone,
        email: customer.email
      };
    });

    const allShopsArray = Object.values(allShops).flat();
    const shopPosition = await this.bdayappendService.getStorePosition(
      "./accuzip_csv_files/Shop_position.csv",
    );
    const contractCountArray = await this.reportService.getSheetData(
      spreadSheetId,
      "Sheet1",
    );

    const contractCounts = contractCountArray.map((item) => {
      return {
        id: item[0] || "",
        count:
          item[1] === null || item[1] === undefined
            ? null
            : parseInt(item[1].replace(/,/g, ""), 10),
      };
    });

    let accuzipCounts = allShopsArray.reduce((acc, shop) => {
      const { wowShopId } = shop;
      const eachShop = shopPosition.find(
        (shop) => Number(shop.wsid) == wowShopId,
      );

      // Initialize counts if not already done
      acc[wowShopId] = acc[wowShopId] || {
        countBefore48MosV: 0,
        countBefore48MosNonV: 0,
        countBefore48MosFarToo: 0,
        countAfter48MosNonV: 0,
        countAfter48MosV: 0,
        countAfter48MosVFarToo: 0,
        processedCustomersUnder48: [],
        processedCustomersOver48: [],
      };

      // Loop through accuzipCustomers once for each shop
      accuzipCustomers.forEach((customer) => {
        if (Number(customer.wsid) === wowShopId) {
          const authDate = new Date(customer.authdate);
          if (authDate < date48MosAgo) {
            if (customer.status?.trim() !== "V") {
              acc[wowShopId].countBefore48MosNonV++;
            } else {
              if (eachShop) {
                let isMailable: boolean = false;
                let distance = this.bdayappendDistanceSErvice.calculateDistance(
                  Number(customer.latitude),
                  Number(customer.logitude),
                  eachShop.latitude,
                  eachShop.logitude,
                );

                if (
                  eachShop.wsid !== `1008` &&
                  eachShop.wsid !== `1054` &&
                  eachShop.wsid !== `1072` &&
                  distance <= 50
                ) {
                  isMailable = true;
                }

                if ((eachShop.wsid === `1008` || eachShop.wsid === `1054` || eachShop.wsid === `1072`) && distance <= 25
                ) {
                  // isMailable = true;
                }

                if (isMailable == true) {
                  acc[wowShopId].countBefore48MosV++;
                  acc[wowShopId].processedCustomersOver48.push({
                    ...customer,
                    authdate: new Date(customer.authdate)
                      .toISOString()
                      .split("T")[0],
                    distance,
                  });
                }

                if (isMailable === false) {
                  acc[wowShopId].countBefore48MosFarToo++;
                }
              }
            }
          } else if (customer.status?.trim() !== "V") {
            acc[wowShopId].countAfter48MosNonV++;
          } else if (customer.status?.trim() === "V") {
            let isMailable: boolean = false;
            if (eachShop) {
              let distance = this.bdayappendDistanceSErvice.calculateDistance(
                Number(customer.latitude),
                Number(customer.logitude),
                eachShop.latitude,
                eachShop.logitude,
              );
              if (
                eachShop.wsid !== `1008` &&
                eachShop.wsid !== `1054` &&
                eachShop.wsid !== `1072` &&
                distance <= 50
              ) {
                isMailable = true;
              }

              if (
                (eachShop.wsid === `1008` || eachShop.wsid === `1054` || eachShop.wsid === '1072') &&
                distance <= 25
              ) {
                isMailable = true;
              }

              if (isMailable === true) {
                acc[wowShopId].countAfter48MosV++;
                acc[wowShopId].processedCustomersUnder48.push({
                  ...customer,
                  authdate: new Date(customer.authdate)
                    .toISOString()
                    .split("T")[0],
                  distance,
                });
              }

              if (isMailable === false) {
                acc[wowShopId].countAfter48MosVFarToo++;
              }
            }
          }
        }
      });

      return acc;
    }, {} as { [key: number]: any });

    // console.log(accuzipCounts);

    // let allProcessedCustomersOver48 = Object.values(cleanupLists).reduce((accumulator: any [], currentValue) => {
    //   if (currentValue.validCustomersOver48) {
    //     return accumulator.concat(currentValue.validCustomersOver48);
    //   }
    //   return accumulator;
    // }, []);


    // await this.exportMalingCustomers.mailinigCustomers([
    //   ...cleanupLists[5017].u48ValidCustomers,
    //   ...cleanupLists[5017].o48ValidCustomers

    //   // ...accuzipCounts[5016].u48ValidCustomers,
    //   // ...allProcessedCustomersOver48
    // ]);

    const promises: Promise<any>[] = Object.entries(cleanupLists).map(async ([wowShopId, count]) => {
      // accuzipCounts[Number(wowShopId)].processedCustomersUnder48.sort(
      //   (a: any, b: any) => b.authdate - a.authdate,
      // );


      count.u48ValidCustomers.sort((a, b) => b.authDate - a.authDate);
      count.o48ValidCustomers.sort((a, b) => b.authDate - a.authDate);
      let activeMails: number | null;
      let newestVisit: any;
      let oldestVisit: any;

      const contractCount = contractCounts.filter(
        (item) => Number(item.id) === Number(wowShopId),
      )[0].count;

      if (contractCount === null) {
        activeMails = null;
        oldestVisit = null;
        newestVisit = null;
      } else {
        let currentCount = 0;
        currentCount += count.u48ValidCustomers.length;

        if (currentCount >= contractCount) {
          activeMails = contractCount;
          oldestVisit = count.u48ValidCustomers
            .slice(0, contractCount)
            .at(-1).authDate;
          newestVisit = count.u48ValidCustomers.slice(0, contractCount)[0]
            .authDate;
        } else {
          currentCount +=
            accuzipCounts[Number(wowShopId)].processedCustomersUnder48.length;
          if (currentCount >= contractCount) {
            activeMails = contractCount;

            oldestVisit = accuzipCounts[
              Number(wowShopId)
            ].processedCustomersUnder48
              .slice(0, contractCount - count.u48ValidCustomers.length)
              .at(-1)?.authdate;

            newestVisit =
              count.u48ValidCustomers.length !== 0
                ? count.u48ValidCustomers[0].authDate
                : accuzipCounts[Number(wowShopId)].processedCustomersUnder48[0]
                    ?.authdate;
          } else {
            currentCount += count.o48ValidCustomers.length;
            if (currentCount >= contractCount) {
              activeMails = contractCount;
              oldestVisit =
                count.o48ValidCustomers.length !== 0
                  ? count.o48ValidCustomers
                      .slice(
                        0,
                        contractCount -
                          count.u48ValidCustomers.length -
                          accuzipCounts[Number(wowShopId)]
                            .processedCustomersUnder48.length,
                      )
                      .at(-1).authDate
                  : accuzipCounts[
                      Number(wowShopId)
                    ].processedCustomersUnder48.at(-1)?.authdate;

              newestVisit =
                count.u48ValidCustomers.length !== 0
                  ? count.u48ValidCustomers[0].authDate
                  : accuzipCounts[Number(wowShopId)]
                      .processedCustomersUnder48[0]?.authdate;
            } else {
              activeMails = currentCount;
              oldestVisit =
                count.o48ValidCustomers.length !== 0
                  ? count.o48ValidCustomers.at(-1).authDate
                  : accuzipCounts[
                      Number(wowShopId)
                    ].processedCustomersUnder48.at(-1)?.authdate;

              newestVisit =
                count.u48ValidCustomers.length !== 0
                  ? count.u48ValidCustomers[0].authDate
                  : accuzipCounts[Number(wowShopId)]
                      .processedCustomersUnder48[0]?.authdate;
            }
          }
        }
      }

      oldestVisit = new Date(oldestVisit ? oldestVisit : "1970-01-01");
      newestVisit = new Date(newestVisit ? newestVisit : "1970-01-01");
      console.log(wowShopId);
      console.log(allShops['tek'].filter(shop => shop.wowShopId === Number(wowShopId))[0]?.shopId);

      const shop = allShops['tek'].filter(shop => shop.wowShopId === Number(wowShopId))[0];
      const shopId = ((shop && shop.shopId) || 0)
      const tekLength = (await this.db.query(`SELECT id FROM tekcustomer${Math.floor(shopId / 500)} WHERE okformarketing != true AND shopid = '${shopId}'`)).rows.length

      const swshop = allShops['sw'].filter(shop => shop.wowShopId === Number(wowShopId))[0];
      const swShopId = ((swshop && swshop.shopId) || 0)
      const swLength = (await this.db.query(`SELECT id FROM shopwarecustomer WHERE shopid = ${swShopId} AND okmarketing != true`)).rows.length;

      
      console.log('--------------Tek Length', tekLength)

      return new Promise((resolve) => {
        resolve([
          undefined,
          count.software,
          count.shopName,
          undefined,
          wowShopId,
          undefined,
          undefined,
          noCleanupLists.filter(
            (customer) =>
              customer.wowShopId === Number(wowShopId) &&
              customer.isDuplicate !== "Duplicate",
          ).length,
          count.software === 'Tek' ? tekLength 
          : count.software === 'mit' ? '0' 
            : count.software === 'nap' ? '0'
              : count.software === 'SW' ? swLength
                : '0',
          undefined,
          undefined,
          activeMails,
          oldestVisit !== null ? oldestVisit.toISOString().split("T")[0] : null,
          newestVisit !== null ? newestVisit.toISOString().split("T")[0] : null,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
        count.noValidCustomersOver48,
          count.noValidCustomersUnder48,
          count.validCustomersOver48,
          count.validCustomersUnder48,
          accuzipCounts[Number(wowShopId)].countBefore48MosNonV || 0,
          accuzipCounts[Number(wowShopId)].countAfter48MosNonV || 0,
          accuzipCounts[Number(wowShopId)].countBefore48MosFarToo || 0,
          accuzipCounts[Number(wowShopId)].countAfter48MosVFarToo || 0,
          accuzipCounts[Number(wowShopId)].countBefore48MosV || 0,
          undefined,
          undefined,
          accuzipCounts[Number(wowShopId)].countAfter48MosV || 0,
        ])
      })

      // return [
      //   undefined,
      //   count.software,
      //   count.shopName,
      //   undefined,
      //   wowShopId,
      //   undefined,
      //   undefined,
      //   noCleanupLists.filter(
      //     (customer) =>
      //       customer.wowShopId === Number(wowShopId) &&
      //       customer.isDuplicate !== "Duplicate",
      //   ).length,
      //   count.software === 'Tek' ? tekLength : "",
      //   undefined,
      //   undefined,
      //   activeMails,
      //   oldestVisit !== null ? oldestVisit.toISOString().split("T")[0] : null,
      //   newestVisit !== null ? newestVisit.toISOString().split("T")[0] : null,
      //   undefined,
      //   undefined,
      //   undefined,
      //   undefined,
      //   undefined,
      //   undefined,
      // count.noValidCustomersOver48,
      //   count.noValidCustomersUnder48,
      //   count.validCustomersOver48,
      //   count.validCustomersUnder48,
      //   accuzipCounts[Number(wowShopId)].countBefore48MosNonV || 0,
      //   accuzipCounts[Number(wowShopId)].countAfter48MosNonV || 0,
      //   accuzipCounts[Number(wowShopId)].countBefore48MosFarToo || 0,
      //   accuzipCounts[Number(wowShopId)].countAfter48MosVFarToo || 0,
      //   accuzipCounts[Number(wowShopId)].countBefore48MosV || 0,
      //   undefined,
      //   undefined,
      //   accuzipCounts[Number(wowShopId)].countAfter48MosV || 0,
      // ];
    });
    const data = await Promise.all(promises);

    const rage = this.reportService.getRangeForData(data);

    await this.reportService.updateSheet(spreadSheetId, rage, data);
  }

  async getCleanupLists(
    allShops: allShopObject,
    date48MosAgo: Date,
  ): Promise<{ [key: number]: customerCounts }> {
    let cleanupLists = await this.listcleanupDedupeService.dedupeCustomers(
      allShops,
      48,
      true,
    );

    cleanupLists = cleanupLists.filter((c) => c.isDuplicate !== "Duplicate");

    // Accuzip processing customers.
    const res = await this.db.query(
      `SELECT  c.id as id, c.wsid as wsid FROM accuzipcustomer AS c`,
    );
    const accuzipCustomers = res.rows;

    // Id of accuip processed customers
    const accuzipCustomersId = new Set(
      accuzipCustomers.map((c) => c.id.trim()),
    );
    //  removed the accuzip process customers.
    const removedAccuzipCustomers = cleanupLists.filter(
      (customer) =>
        !accuzipCustomersId.has(
          customer.software !== "pro"
            ? customer.wowShopId !== 1056
              ? customer.id.trim() + customer.wowShopId
              : customer.id.trim() + "-" + "1056"
            : customer.id.trim(),
        ),
    );

    const cleanupListsId = new Set(
      cleanupLists.map((c) =>
        c.software === "pro"
          ? c.id.trim()
          : c.wowShopId === 1056
          ? c.id.trim() + "-" + c.wowShopId
          : c.id.trim() + c.wowShopId,
      ),
    );

    const restCustomers = accuzipCustomers.filter(
      (custmer) => !cleanupListsId.has(custmer.id),
    );

    // console.log(restCustomers.filter((c) => (c.wsid = "1009")));

    const cleanupList = removedAccuzipCustomers.reduce((result, customer) => {
      const currentCount = result[customer.wowShopId] || {
        validCustomersUnder48: 0,
        noValidCustomersUnder48: 0,
        validCustomersOver48: 0,
        noValidCustomersOver48: 0,
        u48ValidCustomers: [],
        o48ValidCustomers: [],
        shopName: customer.shopName.trim(),
        software: customer.software.trim(),
      };

      if (
        customer.isBadAddress !== "Bad Address" &&
        customer.nameCode !== "Bad Name"
      ) {
        if (customer.authDate >= date48MosAgo) {
          currentCount.validCustomersUnder48 += 1;
          currentCount.u48ValidCustomers.push(customer);
        } else {
          currentCount.validCustomersOver48 += 1;
          currentCount.o48ValidCustomers.push(customer);
        }
      } else {
        if (customer.authDate >= date48MosAgo) {
          currentCount.noValidCustomersUnder48 += 1;
        } else {
          currentCount.noValidCustomersOver48 += 1;
        }
      }

      result[customer.wowShopId] = currentCount;
      return result;
    }, {} as { [key: number]: customerCounts });

    cleanupList[1056] = {
      validCustomersUnder48: 0,
      noValidCustomersUnder48: 0,
      validCustomersOver48: 0,
      noValidCustomersOver48: 0,
      u48ValidCustomers: [],
      o48ValidCustomers: [],
      shopName: "St. Joseph Auto",
      software: "mit",
    };

    return cleanupList;
  }

  async updatedDB(allShops: allShopObject) {
    const endDate = new Date();
    const endDateStr = endDate.toISOString();
    endDate.setDate(endDate.getDate() - 4);
    const startDateStr = endDate.toISOString();

    // Update the tek shops.
    await Promise.all(
      allShops.tek.map((shop, idx) =>
        this.fetchAndWriteTekNewData(shop.shopId, startDateStr, endDateStr),
      ),
    );
    // Update the pro shops.
    await this.fetchAndWriteProNewData(startDateStr);
    // Update the sw shops.
    const swShops = [3065, 4186, 4979];
    await Promise.all(
      swShops.map((tenantId) =>
        this.fetchAndWriteSWNewData(tenantId, startDateStr),
      ),
    );
  }
  // Tekmetric.
  async fetchTekNewChunkCustomers(
    index: number,
    shopId: number,
    startDateStr: string,
    endDateStr: string,
  ): Promise<TekmetricCustomerObject[]> {
    const result = await this.tekmetricApiService.fetch<{
      content: TekmetricCustomerObject[];
    }>(
      `/customers?page=${index}&size=100&shop=${shopId}&updatedDateStart=${startDateStr}&updatedDateEnd=${endDateStr}`,
    );

    return result.content;
  }

  async fetchTekNewChunkJobs(
    index: number,
    shopId: number,
    startDateStr: string,
    endDateStr: string,
  ): Promise<TekmetricJobObject[]> {
    const result = await this.tekmetricApiService.fetch<{
      content: TekmetricJobObject[];
    }>(
      `/jobs?page=${index}&size=100&shop=${shopId}&updatedDateStart=${startDateStr}&updatedDateEnd=${endDateStr}`,
    );
    return result.content;
  }

  // Funtion to update the whole tek shops.
  async fetchAndWriteTekNewData(
    shopId: number,
    startDateStr: string,
    endDateStr: string,
  ) {
    console.log(shopId);

    const resultCustomers = await this.tekmetricApiService.fetch<{
      content: TekmetricCustomerObject[];
      totalPages: number;
      size: number;
    }>(
      `/customers?shop=${shopId}&updatedDateStart=${startDateStr}&updatedDateEnd=${endDateStr}`,
    );

    const pageGroup1 =
      Math.floor((resultCustomers.totalPages * resultCustomers.size) / 300) + 1;
    const pageArray1 = new Array(pageGroup1).fill(1);

    await Promise.all(
      pageArray1.map(async (page, idx) => {
        const customers = await this.fetchTekNewChunkCustomers(
          idx,
          shopId,
          startDateStr,
          endDateStr,
        );
        await this.tekmetricCustomerService.writeToDB(shopId, customers);
      }),
    );

    const resultJobs = await this.tekmetricApiService.fetch<{
      content: TekmetricJobObject[];
      totalPages: number;
      size: number;
    }>(
      `/jobs?shop=${shopId}&updatedDateStart=${startDateStr}&updatedDateEnd=${endDateStr}`,
    );

    const pageGroup2 =
      Math.floor((resultJobs.totalPages * resultJobs.size) / 300) + 1;
    const pageArray2 = new Array(pageGroup2).fill(1);

    await Promise.all(
      pageArray2.map(async (page, idx) => {
        const jobs = await this.fetchTekNewChunkJobs(
          idx,
          shopId,
          startDateStr,
          endDateStr,
        );
        await this.tekmetricJobsService.writeToDB(shopId, jobs);
      }),
    );
  }
  // Protractor.
  // Function to update the whole pro shops.
  async fetchAndWriteProNewData(startDateStr: string) {

    await Promise.all(
      protractorShops.map((shop) =>
        this.proDateService.fetchAndWriteProData(
          startDateStr,
          180,
          shop.shopName,
          shop.apiKey,
          shop.id,
        ),
      ),
    );
  }
  // Shopware.
  async fetchSWNewChunkCustomers(
    tenantId: number,
    currentPage: number,
    startDateStr: string,
  ): Promise<SWCustomerObject[]> {
    const res = await this.swApiService.fetch<SWDataCustomer>(
      `/tenants/${tenantId}/customers?page=${currentPage}&updated_after=${startDateStr}`,
    );

    return res.results;
  }

  async fetchSWNewChunkRepairorders(
    tenantId: number,
    currentPage: number,
    startDateStr: string,
  ): Promise<SWRepairOrderObject[]> {
    const res = await this.swApiService.fetch<SWDataRepairorder>(
      `/tenants/${tenantId}/repair_orders?page=${currentPage}&updated_after=${startDateStr}`,
    );

    return res.results;
  }

  async fetchAndWriteSWNewData(tenantId: number, startDateStr: string) {
    const swCustomers = await this.swApiService.fetch<SWDataCustomer>(
      `/tenants/${tenantId}/customers?updated_after=${startDateStr}`,
    );
    const totalPages1 = swCustomers.total_pages;
    const pageArray1 = new Array(totalPages1).fill(1);

    await Promise.all(
      pageArray1.map(async (item, idx) => {
        const customers = await this.fetchSWNewChunkCustomers(
          tenantId,
          idx + 1,
          startDateStr,
        );
        await this.swCustomerService.writeToDB(tenantId, customers);
      }),
    );

    const swRepairOrders = await this.swApiService.fetch<SWDataRepairorder>(
      `/tenants/${tenantId}/repair_orders?updated_after=${startDateStr}`,
    );
    const totalPages2 = swRepairOrders.total_pages;
    const pageArray2 = new Array(totalPages2).fill(1);

    await Promise.all(
      pageArray2.map(async (item, idx) => {
        const repairOrders = await this.fetchSWNewChunkRepairorders(
          tenantId,
          idx + 1,
          startDateStr,
        );
        await this.swRepairOrderService.writeToDB(tenantId, repairOrders);
      }),
    );
  }
}
