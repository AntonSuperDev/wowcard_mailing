import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import csv from "csv-parser";
import { customerObject } from "../bdayappend/bdayappend.service";
import { bdayCustomerObject } from "../bdayappend/bdayappend.service";
import { MailinglistGetValidCustomerService } from "./mailinglist.getvalidcustomers.service";

import { BdayappendService } from "../bdayappend/bdayappend.service";
import { BdayAppendDistanceService } from "../bdayappend/bdayappend.distance.service";

type bdayObject = {
  cid: string;
  wsid: string;
  first: string;
  last: string;
  address: string;
  bdayyr: string;
  bdaymo: string;
};

@Injectable()
export class MailinglistCountsService {
  constructor(
    private readonly bdayappendService: BdayappendService,
    private readonly bdayAppendDistanceService: BdayAppendDistanceService,
    private readonly mailinglistGetValidCustomerService: MailinglistGetValidCustomerService,
  ) {}

  async readAccuzipResult(filePath: string): Promise<customerObject[]> {
    const results: any = [];
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on(
          "data",
          (data: {
            wsid: string;
            wcaid: string;
            software: string;
            shop_name: string;
            sid: string;
            cid: string;
            authdate: string;
            mbdayyr: string;
            mbdaymo: string;
            tbdaymo: string;
            first: string;
            last: string;
            address: string;
            address2: string;
            city: string;
            st: string;
            zip: string;
            status_: string;
            latitude_: string;
            longitude_: string;
          }) => {
            if (data["status_"]?.trim() === "V") {
              results.push({
                wsId: data["wsid"].trim(),
                wcaId: data["wcaid"].trim(),
                software: data["software"].trim(),
                shopId: data["sid"].trim(),
                shopName: data["shop_name"]?.trim(),
                customerId: data["cid"].trim(),
                authdate: data["authdate"].trim(),
                mbdayyr: data["mbdayyr"].trim(),
                mbdaymo: data["mbdaymo"].trim(),
                tbdaymo: data["tbdaymo"].trim(),
                firstName: data["first"].trim(),
                lastName: data["last"].trim(),
                address: data["address"].trim(),
                address2: data["address2"].trim(),
                city: data["city"].trim(),
                state: data["st"].trim(),
                zip: data["zip"].trim(),
                status: data["status_"].trim(),
                latitude: Number(data["latitude_"].trim()),
                logitude: Number(data["longitude_"].trim()),
              });
            }
          },
        )
        .on("end", () => {
          resolve(results);
        })

        .on("error", (error) => {
          reject(error);
        });
    });
  }

  async readAppendedBday(filePath: string): Promise<bdayObject[]> {
    const results: any = [];
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on(
          "data",
          (data: {
            CID: string;
            WSID: string;
            First: string;
            Last: string;
            Address: string;
            "DOB-Mo": number;
            "DOB-Yr": number;
          }) => {
            results.push({
              cid: data["CID"].trim(),
              wsid: data["WSID"].trim(),
              first: data["First"].trim(),
              last: data["Last"].trim(),
              address: data["Address"].trim(),
              bdayyr: String(data["DOB-Yr"]),
              bdaymo: String(data["DOB-Mo"]),
            });
          },
        )
        .on("end", () => {
          resolve(results);
        })

        .on("error", (error) => {
          reject(error);
        });
    });
  }

  async readStShopAuthDate(
    filePath: string,
  ): Promise<{ customerId: string; authDate: string }[]> {
    const results: any = [];
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data: { CustId: string; LastInDate: string }) => {
          results.push({
            customerId: data["CustId"].trim(),
            authDate: data["LastInDate"].trim(),
          });
        })
        .on("end", () => {
          resolve(results);
        })

        .on("error", (error) => {
          reject(error);
        });
    });
  }

  async appendBday(
    // filePath: string,
    stPath: string = "./accuzip_csv_files/st joseph auto processed.csv",
    // bdayPath: string,
  ): Promise<customerObject[]> {
    // const noBdayCustomers1 = await this.readAccuzipResult(filePath);
    const u48validCustomers =
      await this.mailinglistGetValidCustomerService.appendBdays();
    const noBdayCustomers2 = await this.readAccuzipResult(stPath);
    const noBdayCustomer2WithAuthDate = await this.readStShopAuthDate(
      `./accuzip_csv_files/St._Joseph_Automotive_&_Diesel__db (1).csv`,
    );

    noBdayCustomers2.map((customer) => {
      customer.wsId = "1056";
      customer.shopName = "St. Joseph Automotive & Diesel";
      const res = noBdayCustomer2WithAuthDate.filter(
        (item) => item.customerId === customer.customerId,
      );
      customer.authdate = res[0].authDate;
    });

    const noBdayCustomers = [...u48validCustomers, ...noBdayCustomers2];

    return noBdayCustomers;

    // const bdays = await this.readAppendedBday(bdayPath);

    // const bdayMap = new Map<string, bdayObject>();

    // bdays.forEach((bday) => {
    //   const key =
    //     `${bday.cid.trim()}-${bday.first.trim()}-${bday.last.trim()}-${bday.address.trim()}`.toLowerCase();
    //   bdayMap.set(key, bday);
    // });

    // const shopCustomerCounts: { [shopId: string]: number } = {};

    // noBdayCustomers.forEach((customer) => {
    //   if (!shopCustomerCounts[customer.wsId]) {
    //     shopCustomerCounts[customer.wsId] = 0;
    //   }

    //   shopCustomerCounts[customer.wsId]++;

    //   if (customer.shopId === "2734") {
    //     customer.wsId = "1060";
    //   }

    //   if (customer.wsId === "1024") {
    //     customer.shopName = "Aero Auto Repair Vista";
    //   }

    //   if (customer.shopName.trim() === "Primary Care Auto Repair".trim()) {
    //     customer.wsId = "2000";
    //   }

    //   const key =
    //     `${customer.customerId.trim()}-${customer.firstName.trim()}-${customer.lastName.trim()}-${customer.address.trim()}`.toLowerCase();
    //   const matchingBday = bdayMap.get(key);

    //   if (matchingBday) {
    //     customer.mbdayyr = matchingBday.bdayyr;
    //     customer.mbdaymo = matchingBday.bdaymo;
    //   }
    // });

    // return noBdayCustomers.filter((customer) => {
    //   const currentDate = new Date();
    //   let limitMonths = 48;

    //   // if (shopCustomerCounts[customer.wsId] >= 1800 ) {
    //   //   limitMonths = 48;
    //   // } else {
    //   //   limitMonths = 51;
    //   // }

    //   currentDate.setMonth(currentDate.getMonth() - limitMonths);
    //   return new Date(customer.authdate) >= currentDate;
    // });
  }

  async limitBased25Mi(
    // filePath: string,
    stPath: string,
    // bdayPath: string,
    storePath: string,
  ): Promise<bdayCustomerObject[]> {
    const customers = await this.appendBday(stPath);
    const storePosition = await this.bdayappendService.getStorePosition(
      storePath,
    );

    const newCustomers = await Promise.all(
      customers.map((customer) => {
        const customerLat = customer.latitude;
        const customerLon = customer.logitude;

        let shop = null;
        shop = storePosition.find((shop) => shop.wsid == customer.wsId);

        let distance = null;
        let isMailable = false;

        if (shop) {
          const shopLat = shop.latitude;
          const shopLon = shop.logitude;
          distance = this.bdayAppendDistanceService.calculateDistance(
            customerLat,
            customerLon,
            shopLat,
            shopLon,
          );

          if (shop.wsid !== `1008` && shop.wsid !== `1054` && shop.wsid !== `1072` && distance <= 50) {
            isMailable = true;
          }

          if (
            (shop.wsid === `1008` || shop.wsid === `1054` || shop.wsid === `1072`) &&
            distance <= 25
          ) {
            isMailable = true;
          }
        }
        return {
          ...customer,
          wcId: "",
          distance: distance != null ? distance : null,
          isMailable: isMailable,
          shopname: shop ? shop.name : "",
        };
      }),
    );

    return newCustomers;
  }

  async limitBased50Mi(
    stPath: string,
    storePath: string,
  ): Promise<bdayCustomerObject[]> {
    const newCustomers = await this.limitBased25Mi(stPath, storePath);
    const storePosition = await this.bdayappendService.getStorePosition(
      storePath,
    );

    let result: { [key: string]: { true: number; false: number } } = {};
    let shops: string[] = [];

    newCustomers.forEach((customer) => {
      if (!result[customer.wsId]) {
        result[customer.wsId] = { true: 0, false: 0 };
      }

      result[customer.wsId][customer.isMailable ? "true" : "false"] += 1;
    });

    for (let wsId in result) {
      let trueCount = result[wsId].true;
      let falseCount = result[wsId].false;

      if (trueCount < falseCount * 9) {
        shops.push(wsId);
        await Promise.all(
          newCustomers
            .filter((customer) => customer.wsId === wsId)
            .map((customer) => {
              const customerLat = customer.latitude;
              const customerLon = customer.logitude;
              const shop = storePosition.find((shop) => shop.wsid === wsId);
              let distance = null;
              if (shop) {
                const shopLat = shop.latitude;
                const shopLon = shop.logitude;
                distance = this.bdayAppendDistanceService.calculateDistance(
                  customerLat,
                  customerLon,
                  shopLat,
                  shopLon,
                );
                if (distance <= 50) {
                  customer.isMailable = true;
                } else {
                  customer.isMailable = false;
                }
              }
            }),
        );
      }
    }

    return newCustomers;
  }

  async listCleanup(stPath: string, storePath: string) {
    const customers = await this.limitBased25Mi(stPath, storePath);
    const newCustomers = customers.map((customer) => {
      let nameCode = {
        firstName: "",
        lastName: "",
        fullName: "",
      };

      let newCustomer = { ...customer };

      if (Number(newCustomer.mbdaymo) === 0) {
        newCustomer.tbdaymo = "";
        newCustomer.mbdaymo = "";
      }

      newCustomer.tbdaymo = "";

      const keywords = [
        "Associates",
        "Auto Body",
        "Autobody",
        "Center",
        "Company",
        "Corp",
        "Dept",
        "Enterprise",
        "Inc.",
        "Insurance",
        "Landscap",
        "LLC",
        "Motor",
        "Office",
        "Rental",
        "Repair",
        "Salvage",
        "Service",
        "Supply",
        "Tire",
        "Towing",
      ];

      if (/[-&,*^\/]|(\()|( and )|( OR )/i.test(newCustomer.firstName)) {
        newCustomer.firstName = newCustomer.firstName
          .split(/[-&,*^\/]|(\()|( and )|( OR )/i)[0]
          .trim();
        nameCode.firstName = "New Name";
        if (
          /'\s|[@]/.test(newCustomer.firstName) ||
          newCustomer.firstName.trim().split(/\s/).length > 2
        ) {
          newCustomer.firstName = "";
          nameCode.firstName = "Bad Name";
        } else if (
          newCustomer.firstName.trim().length === 1 ||
          newCustomer.firstName.trim().length === 0
        ) {
          newCustomer.firstName = "";
          nameCode.firstName = "Bad Name";
        } else if (
          /\d/.test(newCustomer.firstName) ||
          newCustomer.firstName.includes("'S ") ||
          newCustomer.firstName.includes("'s ")
        ) {
          newCustomer.firstName = "";
          nameCode.firstName = "Bad Name";
        } else if (
          keywords.some((keyword) => newCustomer.firstName.includes(keyword))
        ) {
          newCustomer.firstName = "";
          nameCode.firstName = "Bad Name";
        } else if (
          /\bAuto\b/.test(newCustomer.firstName) ||
          /\bCar\b/.test(newCustomer.firstName) ||
          /\bInc\b/.test(newCustomer.firstName) ||
          /\bTown\b/.test(newCustomer.firstName)
        ) {
          newCustomer.firstName = "";
          nameCode.firstName = "Bad Name";
        } else if (newCustomer.firstName.trim().length > 12) {
          newCustomer.firstName = "";
          nameCode.firstName = "Bad Name";
        }
      } else if (
        /'\s|[@]/.test(newCustomer.firstName) ||
        newCustomer.firstName.trim().split(/\s/).length > 2
      ) {
        newCustomer.firstName = "";
        nameCode.firstName = "Bad Name";
      } else if (
        newCustomer.firstName.trim().length === 1 ||
        newCustomer.firstName.trim().length === 0
      ) {
        newCustomer.firstName = "";
        nameCode.firstName = "Bad Name";
      } else if (
        /\d/.test(newCustomer.firstName) ||
        newCustomer.firstName.includes("'S ") ||
        newCustomer.firstName.includes("'s ")
      ) {
        newCustomer.firstName = "";
        nameCode.firstName = "Bad Name";
      } else if (
        keywords.some((keyword) => newCustomer.firstName.includes(keyword))
      ) {
        newCustomer.firstName = "";
        nameCode.firstName = "Bad Name";
      } else if (
        /\bAuto\b/.test(newCustomer.firstName) ||
        /\bCar\b/.test(newCustomer.firstName) ||
        /\bInc\b/.test(newCustomer.firstName) ||
        /\bTown\b/.test(newCustomer.firstName)
      ) {
        newCustomer.firstName = "";
        nameCode.firstName = "Bad Name";
      } else if (newCustomer.firstName.trim().length > 12) {
        newCustomer.firstName = "";
        nameCode.firstName = "Bad Name";
      } else {
        nameCode.firstName = "";
      }

      if (/[-,*^\/]/.test(newCustomer.lastName)) {
        let splitName = newCustomer.lastName.split(/[-,*^\/]/);
        if (splitName[1].length === 0) {
          newCustomer.lastName = splitName[0].trim();
          if (newCustomer.lastName.includes(" OR ")) {
            newCustomer.lastName = newCustomer.lastName.split(" OR ")[1];
          }
        } else {
          newCustomer.lastName = splitName[1].trim();
          if (newCustomer.lastName.includes(" OR ")) {
            newCustomer.lastName = newCustomer.lastName.split(" OR ")[1];
          }
        }
        nameCode.lastName = "New Name";
        if (
          /[@]|[&]|(\))/.test(newCustomer.lastName) ||
          newCustomer.lastName.trim().length === 1
        ) {
          newCustomer.lastName = "";
          nameCode.lastName = "Bad Name";
        } else if (
          /\d/.test(newCustomer.lastName) ||
          newCustomer.lastName.includes("'S ") ||
          newCustomer.lastName.includes("'s ") ||
          newCustomer.lastName.split(".").length > 2
        ) {
          newCustomer.lastName = "";
          nameCode.lastName = "Bad Name";
        } else if (newCustomer.lastName.trim().length > 14) {
          newCustomer.lastName = "";
          nameCode.lastName = "Bad Name";
        }
      } else if (
        /[@]|[&]|(\))/.test(newCustomer.lastName) ||
        newCustomer.lastName.trim().length === 1 ||
        newCustomer.lastName.trim().length === 0
      ) {
        newCustomer.lastName = "";
        nameCode.lastName = "Bad Name";
      } else if (
        /\d/.test(newCustomer.lastName) ||
        newCustomer.lastName.includes("'S ") ||
        newCustomer.lastName.includes("'s ") ||
        newCustomer.lastName.split(".").length > 2
      ) {
        newCustomer.lastName = "";
        nameCode.lastName = "Bad Name";
      } else if (newCustomer.lastName.trim().length > 14) {
        newCustomer.lastName = "";
        nameCode.lastName = "Bad Name";
      } else {
        nameCode.lastName = "";
      }

      if (nameCode.firstName == "Bad Name" || nameCode.lastName == "Bad Name") {
        nameCode.fullName = "Bad Name";
      } else if (
        nameCode.firstName == "New Name" ||
        nameCode.lastName == "New Name"
      ) {
        nameCode.fullName = "New Name";
      } else {
        nameCode.fullName = "";
      }

      return newCustomer;
    });

    return newCustomers
      .filter(
        (customer) =>
          customer.firstName.trim() !== "" || customer.lastName.trim() !== "",
      )
      .filter(
        (customer) =>
          customer.isMailable === true || customer.isMailable === false,
      );
  }

  async dedupe(stPath: string, storePath: string) {
    const customers = await this.listCleanup(stPath, storePath);
    console.log("----------->de", customers.length);
    const counts = new Map<string, number>();
    const mailables = new Map<string, Date>();
    const sortedCustomers = [...customers].sort(
      (a, b) => new Date(b.authdate).getTime() - new Date(a.authdate).getTime(),
    );

    sortedCustomers.forEach((customer) => {
      const { firstName, lastName, address, authdate, wcaId, wsId, software } =
        customer;
      const key =
        wcaId != null && wcaId != "" && wcaId != "0"
          ? `${firstName}-${lastName}-${address}-${wcaId}-${software}`
          : `${firstName}-${lastName}-${address}-${wsId}-${software}`;
      counts.set(key, (counts.get(key) || 0) + 1);
      if (!mailables.has(key)) {
        mailables.set(key, new Date(authdate));
      }
    });
    const deDuplicatedCustomers = customers.map((customer) => {
      const { firstName, lastName, address, authdate, wcaId, wsId, software } =
        customer;
      const key =
        wcaId != null && wcaId != "" && wcaId != "0"
          ? `${firstName}-${lastName}-${address}-${wcaId}-${software}`
          : `${firstName}-${lastName}-${address}-${wsId}-${software}`;
      const isDuplicate =
        (counts.get(key) || 0) > 1 && mailables.get(key) !== new Date(authdate)
          ? "Duplicate"
          : "";

      return { ...customer, isDuplicate };
    });

    return deDuplicatedCustomers.filter(customer => customer.isDuplicate === "");
  }

  async assignTBday(stPath: string, storePath: string) {
    let date48Ago = new Date();
    date48Ago.setMonth(date48Ago.getMonth() - 48);

    const res = await this.dedupe(stPath, storePath);
    let u48: any[] = [];
    let o48: any[] = [];
    res.forEach((c) => {
      if (new Date(c.authdate) >= date48Ago) {
        u48.push(c);
      } else {
        o48.push(c);
      }
    });

    const noTobdayCustomersArray = [u48, o48];

    return noTobdayCustomersArray.map((noTobdayCustomers) => {
      const newSortedCustomers = noTobdayCustomers
        .filter((customer) => customer.isMailable === true)
        .sort((a, b) => {
          const dateComparison =
            new Date(a.authdate).getTime() - new Date(b.authdate).getTime();

          if (dateComparison !== 0) {
            return dateComparison;
          }

          return Number(a.mbdaymo) - Number(b.mbdaymo);
        });

      const countsByShopAndMonth: Record<string, Record<string, number>> = {};

      newSortedCustomers.forEach((customer) => {
        let { wsId, mbdaymo } = customer;

        mbdaymo = String(Number(mbdaymo));

        if (!(wsId in countsByShopAndMonth)) {
          countsByShopAndMonth[wsId] = {};
        }

        countsByShopAndMonth[wsId][mbdaymo] =
          (countsByShopAndMonth[wsId][mbdaymo] || 0) + 1;
      });

      const averageByShop: Record<
        string,
        { average: number; remainder: number }
      > = {};

      for (const wsId in countsByShopAndMonth) {
        const counts = Object.values(countsByShopAndMonth[wsId]);
        const totalCustomers = counts.reduce(
          (total, count) => total + count,
          0,
        );
        const average = Math.floor(totalCustomers / 12);
        const remainder = totalCustomers % 12;
        averageByShop[wsId] = { average, remainder };
      }

      const tbdayCounts: Record<string, Record<string, number>> = {};

      for (const wsId in countsByShopAndMonth) {
        tbdayCounts[wsId] = {};
        for (const mbdaymo in countsByShopAndMonth[wsId]) {
          if (mbdaymo !== "0") {
            const actualCount = countsByShopAndMonth[wsId][mbdaymo];
            let { average, remainder } = averageByShop[wsId];
            tbdayCounts[wsId][mbdaymo] = Math.max(0, average - actualCount);
          }
        }

        let tbdaySum = Object.values(tbdayCounts[wsId]).reduce(
          (sum, count) => sum + count,
          0,
        );
        averageByShop[wsId].remainder =
          countsByShopAndMonth[wsId]["0"] - tbdaySum;

        while (averageByShop[wsId].remainder < 0) {
          let { average, remainder } = averageByShop[wsId];
          average -= 1;
          for (const mbdaymo in countsByShopAndMonth[wsId]) {
            if (mbdaymo !== "0") {
              const actualCount = countsByShopAndMonth[wsId][mbdaymo];
              tbdayCounts[wsId][mbdaymo] = Math.max(0, average - actualCount);
            }
          }

          let tbdaySum = Object.values(tbdayCounts[wsId]).reduce(
            (sum, count) => sum + count,
            0,
          );
          averageByShop[wsId].remainder =
            countsByShopAndMonth[wsId]["0"] - tbdaySum;
          averageByShop[wsId].average = average;
        }
      }

      for (const wsId in averageByShop) {
        const { average, remainder } = averageByShop[wsId];
        const months = Object.keys(countsByShopAndMonth[wsId]).slice(1);

        if (remainder >= 0) {
          months.sort(
            (a, b) =>
              countsByShopAndMonth[wsId][a] - countsByShopAndMonth[wsId][b],
          );
          const lowestCountMonth = months.find(
            (month) => countsByShopAndMonth[wsId][month] > 0,
          );

          if (lowestCountMonth) {
            tbdayCounts[wsId][lowestCountMonth] += remainder;
          }
        }
      }

      const results: Record<string, any>[] = [];

      for (const wsId in countsByShopAndMonth) {
        for (const mbdaymo in countsByShopAndMonth[wsId]) {
          if (mbdaymo !== "0") {
            const actualCount = countsByShopAndMonth[wsId][mbdaymo] || 0;
            const tbdayCount = tbdayCounts[wsId][mbdaymo] || 0; // Ensuring tbdayCount is defined and falls back to 0 if undefined
            results.push({
              id: wsId,
              mbdaymo,
              bdaymo: actualCount,
              tbdaymo: tbdayCount,
              all: actualCount + tbdayCount,
            });
          }
        }
      }

      const groupData: { [key: string]: any[] } = {};

      results.forEach((data) => {
        if (!groupData[data.id]) {
          groupData[data.id] = [];
        }

        groupData[data.id].push(data);
      });

      for (const id in groupData) {
        groupData[id].sort((a, b) => a.bdaymo - b.bdaymo);
      }

      const customersWithEmptyMbdaymo = newSortedCustomers.sort(
        (a, b) =>
          new Date(b.authdate).getTime() - new Date(a.authdate).getTime(),
      );

      let customerUpdateCount: { [key: string]: number } = {};

      Object.keys(groupData).forEach((id) => {
        const shopData = groupData[id];
        shopData.forEach((monthData) => {
          if (!customerUpdateCount[monthData.mbdaymo]) {
            customerUpdateCount = {
              ...customerUpdateCount,
              [monthData.mbdaymo]: 0,
            };
          }
          for (let i = 0; i < customersWithEmptyMbdaymo.length; i++) {
            let customer = customersWithEmptyMbdaymo[i];
            if (
              customer.wsId.trim() === id.trim() &&
              Number(customer.mbdaymo) === 0 &&
              Number(customer.tbdaymo) === 0
            ) {
              customer.tbdaymo = monthData.mbdaymo;
              customerUpdateCount = {
                ...customerUpdateCount,
                [monthData.mbdaymo]: customerUpdateCount[monthData.mbdaymo] + 1,
              };
            }
            if (customerUpdateCount[monthData.mbdaymo] >= monthData.tbdaymo) {
              customerUpdateCount = {
                ...customerUpdateCount,
                [monthData.mbdaymo]: 0,
              };
              break;
            }
          }
        });
      });

      return customersWithEmptyMbdaymo;
    });
  }
}
