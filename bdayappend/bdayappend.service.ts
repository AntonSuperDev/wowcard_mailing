import { Injectable, Inject } from "@nestjs/common";
import { BdayAppendDistanceService } from "./bdayappend.distance.service";
import * as fs from "fs";
import csv from "csv-parser";
const csvWriter = require("csv-writer");
import path from "path";
import { Pool } from "pg";

export type customerObject = {
  wsId: string;
  wcaId: string;
  software: string;
  shopId: string;
  shopName: string;
  customerId: string;
  authdate: string;
  mbdayyr: string;
  mbdaymo: string;
  tbdaymo: string;
  firstName: string;
  lastName: string;
  address: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  status: string;
  latitude: number;
  logitude: number;
  crrt: string;
};

type storePositionObject = {
  software: string;
  wsid: string;
  name: string;
  latitude: number;
  logitude: number;
};

export type bdayCustomerObject = {
  wsId: string;
  wcaId: string;
  software: string;
  shopId: string;
  customerId: string;
  authdate: string;
  mbdayyr: string;
  mbdaymo: string;
  tbdaymo: string;
  firstName: string;
  lastName: string;
  address: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  status: string;
  latitude: number;
  logitude: number;
  wcId: string;
  distance: number | null;
  isMailable: boolean;
  shopname: string;
};

@Injectable()
export class BdayappendService {
  constructor(
    private readonly bdayAppendDistanceService: BdayAppendDistanceService,
    @Inject("DB_CONNECTION") private readonly db: Pool,
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
            sid: string;
            shop_name: string;
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
                shopName: data["shop_name"] ? data["shop_name"].trim() : "",
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

  async getStorePosition(filePath: string): Promise<storePositionObject[]> {
    const results: any = [];
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on(
          "data",
          (data: {
            Software: string;
            WSID: string;
            name: string;
            Latitude: string;
            Longitude: string;
          }) => {
            results.push({
              software: data["Software"].trim(),
              wsid: data["WSID"].trim(),
              name: data["name"].trim(),
              latitude: Number(data["Latitude"].trim()),
              logitude: Number(data["Longitude"].trim()),
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

  async readAccuzipcustomers(): Promise<customerObject[]> {
    const res = await this.db.query(
      `SELECT 
      c.id as id,
      c.wsid as wsid,
      c.wcaid as wcaid,
      c.software as software,
      c.shopname as shopname,
      c.authdate as authdate,
      c.mbdayyr as mbdayyr,
      c.mbdaymo as mbdaymo,
      CASE 
        WHEN c.ischanged = 'FL' THEN c.changed_first
        WHEN c.ischanged = 'FA' THEN c.changed_first
        WHEN c.ischanged = 'F' THEN c.changed_first
        WHEN c.ischanged = 'FLA' THEN c.changed_first
        ELSE c.firstname
      END as firstname,
      CASE 
        WHEN c.ischanged = 'FL' THEN c.changed_last
        WHEN c.ischanged = 'L' THEN c.changed_last
        WHEN c.ischanged = 'FLA' THEN c.changed_last
        WHEN c.ischanged = 'LA' THEN c.changed_last
        ELSE c.lastname
      END as lastname,
      CASE 
        WHEN c.ischanged = 'FA' THEN c.changed_address
        WHEN c.ischanged = 'A' THEN c.changed_address
        WHEN c.ischanged = 'FLA' THEN c.changed_address
        WHEN c.ischanged = 'LA' THEN c.changed_address
        ELSE c.address
      END as address,
      CASE 
        WHEN c.ischanged = 'FA' THEN c.changed_city
        WHEN c.ischanged = 'A' THEN c.changed_city
        WHEN c.ischanged = 'FLA' THEN c.changed_city
        WHEN c.ischanged = 'LA' THEN c.changed_city
        ELSE c.city
      END as city,
      CASE 
        WHEN c.ischanged = 'FA' THEN c.changed_zipcode
        WHEN c.ischanged = 'A' THEN c.changed_zipcode
        WHEN c.ischanged = 'FLA' THEN c.changed_zipcode
        WHEN c.ischanged = 'LA' THEN c.changed_zipcode
        ELSE c.zip
      END as zip,
      CASE 
        WHEN c.ischanged = 'FA' THEN c.changed_state
        WHEN c.ischanged = 'A' THEN c.changed_state
        WHEN c.ischanged = 'FLA' THEN c.changed_state
        WHEN c.ischanged = 'LA' THEN c.changed_state
        ELSE c.state
      END as state,
      c.address2 as address2,
      c.latitude_ as latitude,
      c.logitude_ as longitude,
      c.status_ as status,
      c.crrt as crrt
     FROM accuzipcustomer as c
     WHERE c.status_ = 'V'
      
      `
    )
    return res.rows.map(customer => {
        return {
          wsId: customer.wsid,
          wcaId: customer.wcaid,
          software: customer.software,
          shopId: '',
          shopName: customer.shopname,
          customerId: customer.id,
          authdate: customer.authdate,
          mbdayyr: customer.mbdayyr,
          mbdaymo: customer.mbdaymo,
          tbdaymo: '',
          firstName: customer.firstname,
          lastName: customer.lastname,
          address: customer.address,
          address2: customer.address2,
          city: customer.city,
          state: customer.state,
          zip: customer.zip,
          status: customer.status,
          latitude: Number(customer.latitude),
          logitude: Number(customer.longitude),
          crrt: customer.crrt
        }
    
    })
  }

  async noBdayCustomers(
    filePath1: string,
    stShopPath: string,
    filePath2: string,
    bday: boolean,
  ): Promise<bdayCustomerObject[]> {
    // const customers1 = await this.readAccuzipResult(filePath1);
    let date48MosAgo = new Date();
    date48MosAgo.setMonth(date48MosAgo.getMonth() - 65);
    const customers1 = await this.readAccuzipcustomers();

    // console.log(customers1[2]);

    // const customers2 = await this.readAccuzipResult(stShopPath);

    // customers2.map((customer) => {
    //   if (customer.wsId === "") {
    //     customer.wsId = "1056";
    //   }
    // });

    const customers = [...customers1];

    const storePosition = await this.getStorePosition(filePath2);

    const newCustomers = await Promise.all(
      customers.map((customer) => {
        const customerLat = customer.latitude;
        const customerLon = customer.logitude;

        let shop = null;

        if (customer.wsId == "0") {
          shop = storePosition.find(
            (shop) =>
              shop.name.trim().toLowerCase() ==
              customer.shopName.trim().toLowerCase(),
          );
        } else {
          shop = storePosition.find((shop) => shop.wsid == customer.wsId);
        }

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

          if (distance * 0.621371 <= 50) {
            isMailable = true;
          }

          if (
            (shop.wsid === "1054" || shop.wsid === "1008") &&
            distance * 0.621371 <= 25
          ) {
            isMailable = true;
          }
        }

        return {
          ...customer,
          wcId: "",
          distance: distance != null ? distance * 0.621371 : null,
          isMailable: isMailable,
          shopname: shop ? shop.name : "",
        };
      }),
    );

    const bdayCustomers = bday
      ? newCustomers.filter(
          (customer) => customer.isMailable === true && Number(customer.mbdaymo) === 0 && new Date(customer.authdate) > date48MosAgo,
        )
      : newCustomers.filter((customer) => customer.isMailable === true);

    return bdayCustomers;
  }

  async saveBdayInputFile(
    filePath1: string,
    stShopPath: string,
    filePath2: string,
  ) {
    const customers = await this.noBdayCustomers(
      filePath1,
      stShopPath,
      filePath2,
      true,
    );
    const writer = csvWriter.createObjectCsvWriter({
      path: path.resolve(__dirname, `./Bdayinput/BdayInput-2024-03.csv`),
      header: [
        { id: "shopname", title: "Shop Name" },
        { id: "software", title: "Software" },
        { id: "shopId", title: "SID" },
        { id: "customerId", title: "CID" },
        { id: "wcId", title: "WCID" },
        { id: "wsId", title: "WSID" },
        { id: "wcaId", title: "WCAID" },
        { id: "mbdayyr", title: "MBdayYr" },
        { id: "mbdaymo", title: "MBdayMo" },
        { id: "authdate", title: "Auth Date"},
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
}
