import { Injectable, Inject } from "@nestjs/common";
import { Pool } from "pg";
import * as fs from "fs";
import csv from "csv-parser";

export type customerObject = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  address: string | null;
  address2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  authDate: Date;
  byear: string | null;
  bmonth: string | null;
  bday: string | null;
  shopName: string | null;
  shopPhone: string | null;
  shopEmail: string | null;
  software: string;
  wowShopId: number;
  chainId: number | null;
  shopId: number | string | null;
};

@Injectable()
export class TekService {
  constructor(@Inject("DB_CONNECTION") private readonly db: Pool) {}

  async readCSV(): Promise<any[]> {
    const filePath =
      "./add_file/Car Aid - 3826 and 5519_Final - Car Aid - 3826 and 5519_Final.csv";
    const results: any = [];
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", () => {
          resolve(results);
        })
        .on("error", (error) => {
          reject(error);
        });
    });
  }

  async fetchCustomers(
    shopId: number,
    wowShopId: number,
    chainId: number,
    software: string,
    period: number,
    isAll: boolean = false,
  ): Promise<customerObject[]> {
    const tableId = Math.floor(shopId / 500);
    const res = await this.db.query(
      `
            SELECT
                c.id as id,
                c.firstname as firstName,
                c.lastname as lastName,
                c.address1 as address,
                c.address2 as address2,
                c.address_city as city,
                c.address_state as state,
                c.address_zip as zip,
                c.phone1 as phone,
                j.lastauthorized_date as authDate,
                b.b_year as byear,
                b.b_month as bmonth,
                b.b_day as bday,
                s.name as shopName,
                s.phone as shopPhone,
                s.email as shopEmail
            FROM tekcustomer${tableId} AS c
            LEFT JOIN(
                SELECT customerid, MAX(authorizedDate) as lastauthorized_date
                FROM tekjob${tableId}
                GROUP BY customerid
            ) as j
            ON CAST(c.id AS INTEGER) = j.customerid
            LEFT JOIN tekbday b ON
            CASE
            WHEN b.id ~ '^[0-9]+$' THEN CAST(b.id AS INTEGER)
            ELSE NULL
            END = CAST(c.id AS INTEGER)
            LEFT JOIN tekshop as s
            ON c.shopId = s.id
            WHERE (${isAll} OR (j.lastauthorized_date >= DATE(NOW() - INTERVAL '${period} MONTH')))
            AND c.shopId = '${shopId}'
            AND c.okformarketing = true;
            `,
    );

    const customers = res.rows.map((row) => ({
      id: row.id,
      firstName: row.firstname,
      lastName: row.lastname,
      address: row.address,
      address2: row.address2,
      city: row.city,
      state: row.state,
      zip: row.zip,
      authDate: new Date(row.authdate === null ? 0 : row.authdate),
      byear: row.byear,
      // byear: row.phone,
      bmonth: row.bmonth,
      bday: row.bday,
      shopName: row.shopname,
      shopPhone: row.shopphone,
      shopEmail: row.shopemail,
      software: software,
      wowShopId: wowShopId,
      chainId: chainId,
      shopId: shopId,
    }));

    if (wowShopId === 1065) {
      customers.forEach((c) => {
        if (c.address.includes("\n")) {
          c.address = c.address.split("\n")[0];
        }
      });
    }

    if (wowShopId === 1067 || wowShopId === 1066) {
      const addAddress = await this.readCSV();
      customers.forEach((c) => {
        if (c.address.trim() === "") {
          c.address =
            addAddress.filter(
              (customer) => Number(customer["CID"]) === Number(c.id),
            )[0]?.["MD_Address"] || "";
          c.city =
            addAddress.filter(
              (customer) => Number(customer["CID"]) === Number(c.id),
            )[0]?.["MD_City"] || "";
          c.state =
            addAddress.filter(
              (customer) => Number(customer["CID"]) === Number(c.id),
            )[0]?.["MD_State"] || "";
          c.zip =
            addAddress.filter(
              (customer) => Number(customer["CID"]) === Number(c.id),
            )[0]?.["MD_Zip"] || "";
        }
      });
    }

    return customers;
  }

  async read1045AccuzipCustomers() {
    const res = await this.db.query(
      `SELECT * FROM accuzipcustomer as c WHERE c.wsid = '1045'`,
    );

    return res.rows;
  }

  async read1045GoodCusotmers() {
    const res = await this.db.query(
      `select t.id as id, t.birthday as bday from tekcustomer6 as t where t.shopid = '3351'`,
    );

    return res.rows;
  }
}
