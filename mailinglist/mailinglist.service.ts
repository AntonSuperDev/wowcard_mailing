import { Injectable, Inject } from "@nestjs/common";
import * as fs from "fs";
import csv from "csv-parser";
const csvWriter = require("csv-writer");
import path from "path";
import { Pool } from "pg";
import { customerObject } from "../bdayappend/bdayappend.service";
import { bdayCustomerObject } from "../bdayappend/bdayappend.service";
import { BdayAppendDistanceService } from "../bdayappend/bdayappend.distance.service";
import { BdayappendService } from "../bdayappend/bdayappend.service";

@Injectable()
export class MailinglistService {
  constructor(
    @Inject("DB_CONNECTION") private readonly db: Pool,
    private readonly bdayAppendDistanceService: BdayAppendDistanceService,
    private readonly bdayAppendService: BdayappendService,
  ) {}

  async emptyValidAccuzipCustomers() {
    const res = await this.db.query(`
    SELECT 
      CASE 
        WHEN c.software != 'pro' AND c.wsid = '1056' THEN SUBSTRING(c.id FROM 1 FOR LENGTH(c.id) - 5)
        WHEN c.software != 'pro' THEN SUBSTRING(c.id FROM 1 FOR LENGTH(c.id) - 4)
        ELSE c.id
      END AS customerId,
      c.wcaid as wcaId,
      c.wsid as wsId,
      c.software as software,
      c.shopname as shopname,
      c.firstname as firstName,
      c.lastname as lastName,
      c.authdate as authdate,
      c.address as address,
      c.city as city,
      c.state as state,
      c.zip as zip,
      c.mbdayyr as mbdayyr,
      c.mbdaymo as mbdaymo
    FROM accuzipcustomer as c
    WHERE c.status_ = ''
      AND (mbdaymo = '' OR mbdaymo = '0')
      AND Date(c.authdate) <= NOW() - INTERVAL '48 MONTHS';
    `);

    console.log(res.rows[1]);

    // const writer = csvWriter.createObjectCsvWriter({
    //   path: path.resolve(__dirname, "./mailinglist/bdayinput-u60valid.csv"),
    //   header: [
    //     { id: "shopname", title: "Shop Name" },
    //     { id: "software", title: "Software" },
    //     { id: "customerid", title: "CID" },
    //     { id: "wcId", title: "WCID" },
    //     { id: "wsid", title: "WSID" },
    //     { id: "wcaid", title: "WCAID" },
    //     { id: "authdate", title: "Last AuthDate" },
    //     { id: "mbdayyr", title: "MBdayYr" },
    //     { id: "mbdaymo", title: "MBdayMo" },
    //     { id: "firstname", title: "First" },
    //     { id: "lastname", title: "Last" },
    //     { id: "address", title: "Address" },
    //     { id: "city", title: "City" },
    //     { id: "state", title: "St" },
    //     { id: "zip", title: "Zip" },
    //   ],
    // });

    // await writer.writeRecords(res.rows).then(() => {
    //   console.log("Done!");
    // });
  }

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

  async validCustomer(): Promise<bdayCustomerObject[]> {
    const res = await this.readAccuzipResult(
      "./accuzip_csv_files/cleanup-lists1049 export.csv",
    );

    const goodStatusCustomers = res.filter((c) => c.status === "V");

    const storePosition = await this.bdayAppendService.getStorePosition(
      "./accuzip_csv_files/Shop_position.csv",
    );

    const validCustomers = await Promise.all(
      goodStatusCustomers.map((customer) => {
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

          if (distance <= 50) {
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

    return validCustomers;

    // const dbCustomers = await this.db.query(`
    //   SELECT
    //     c.id as id,
    //     c.okformarketing as ismarketing
    //   FROM tekcustomer8 as c
    // `);

    // const okMarketingDBCustomers = dbCustomers.rows.filter(
    //   (c) => c.ismarketing === true,
    // );

    // // console.log(okMarketingDBCustomers);

    // const okMIds = new Set(okMarketingDBCustomers.map((c) => c.id));

    // return validCustomers.filter(
    //   (c) => c.isMailable === true && !okMIds.has(c.customerId),
    // );
  }

  async validNoBdayCustomers() {
    const res = await this.db.query(`
    SELECT 
      CASE 
        WHEN c.software != 'pro' AND c.wsid = '1056' THEN SUBSTRING(c.id FROM 1 FOR LENGTH(c.id) - 5)
        WHEN c.software != 'pro' THEN SUBSTRING(c.id FROM 1 FOR LENGTH(c.id) - 4)
        ELSE c.id
      END AS customerId,
      c.wcaid as wcaId,
      c.wsid as wsId,
      c.software as software,
      c.shopname as shopname,
      c.firstname as firstName,
      c.lastname as lastName,
      c.authdate as authdate,
      c.address as address,
      c.city as city,
      c.state as state,
      c.zip as zip,
      c.mbdayyr as mbdayyr,
      c.mbdaymo as mbdaymo
    FROM accuzipcustomer as c
    WHERE c.status_ = 'V'
      AND (mbdaymo = '' OR mbdaymo = '0')
      AND Date(c.authdate) >= NOW() - INTERVAL '60 MONTHS';
    `);

    console.log(res.rows[1]);

    const writer = csvWriter.createObjectCsvWriter({
      path: path.resolve(__dirname, "./mailinglist/bdayinput-u60valid.csv"),
      header: [
        { id: "shopname", title: "Shop Name" },
        { id: "software", title: "Software" },
        { id: "customerid", title: "CID" },
        { id: "wcId", title: "WCID" },
        { id: "wsid", title: "WSID" },
        { id: "wcaid", title: "WCAID" },
        { id: "authdate", title: "Last AuthDate" },
        { id: "mbdayyr", title: "MBdayYr" },
        { id: "mbdaymo", title: "MBdayMo" },
        { id: "firstname", title: "First" },
        { id: "lastname", title: "Last" },
        { id: "address", title: "Address" },
        { id: "city", title: "City" },
        { id: "state", title: "St" },
        { id: "zip", title: "Zip" },
      ],
    });

    await writer.writeRecords(res.rows).then(() => {
      console.log("Done!");
    });
  }
}
