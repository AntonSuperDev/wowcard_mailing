import { Inject, Injectable } from "@nestjs/common";
import { customerObject } from "../tek/tek.service";
import { Pool } from "pg";
import * as fs from "fs";
import csv from "csv-parser";

@Injectable()
export class MitService {
  constructor(@Inject("DB_CONNECTION") private readonly db: Pool) {}

  async readCSV(filePath: string): Promise<any[]> {
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

  async fetchCustomersFromStShop(): Promise<customerObject[]> {
    const customers1 = await this.readCSV(
      "./accuzip_csv_files/st joseph auto processed.csv",
    );
    const customers2 = await this.readCSV(
      "./accuzip_csv_files/St._Joseph_Automotive_&_Diesel__db (1).csv",
    );

    const newCustomers = customers1.map((customer) => {
      return {
        id: customer.cid.trim(),
        firstName: customer.first.trim(),
        lastName: customer.last.trim(),
        address: customer.address,
        address2: customer.address2,
        city: customer.city,
        state: customer.st,
        zip: customer.zip,
        authDate: new Date(
          customers2.filter(
            (item) => item.CustId.trim() === customer.cid.trim(),
          )[0]?.LastVisited || null,
        ),
        byear: customers2.filter(
          (item) => item.CustId.trim() === customer.cid.trim(),
        )[0]?.Year,
        bmonth: "",
        bday: "",
        shopName: "St. Joseph Auto",
        shopPhone: "",
        shopEmail: "",
        software: "mit",
        wowShopId: 1056,
        chainId: 0,
        shopId: "",
      };
    });

    return newCustomers.filter((customer) => customer.id.trim() !== "");
  }

  async fetchCustomers(
    shopName: string,
    wowShopId: number,
    chainId: number,
    software: string,
    period: number,
    isAll: boolean = false,
  ): Promise<customerObject[]> {
    const res = await this.db.query({
      text: `
                  SELECT DISTINCT
                      c.id,
                      c.shopname as shopname,
                      c.lastvisited_date as authdate,
                      c.firstname as firstname,
                      c.lastname as lastname,
                      c.address_ as address,
                      c.city as city,
                      c.state_ as state,
                      c.zip as zip,
                      c.year_ as byear,
                      c.month_ as bmonth
                  FROM mitcustomer c
                  WHERE ($2 OR (TO_DATE(c.lastvisited_date, 'MM/DD/YYYY') >= (CURRENT_DATE - INTERVAL '1 MONTH' * $3)))
                  AND  c.shopname = $1;
              `,
      values: [shopName, isAll, period],
    });

    const mitCustomers = res.rows.map((row) => {
      return {
        id: row.id,
        firstName: row.firstname,
        lastName: row.lastname,
        address: row.address,
        address2: "",
        city: row.city,
        state: row.state,
        zip: row.zip,
        authDate: new Date(row.authdate),
        byear: row.byear,
        bmonth: row.bmonth,
        bday: "",
        shopName: row.shopname,
        shopPhone: "",
        shopEmail: "",
        software: software,
        wowShopId: wowShopId,
        chainId: chainId,
        shopId: "",
      };
    });

    const stCustomers = await this.fetchCustomersFromStShop();

    return [...mitCustomers, ...stCustomers];
  }
}
