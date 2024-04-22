import { Injectable, Inject } from "@nestjs/common";
import * as fs from "fs";
import csv from "csv-parser";
import path from "path";
import { Pool } from "pg";

@Injectable()
export class BdayWriteToDBService {
  constructor(@Inject("DB_CONNECTION") private readonly db: Pool) {}

  async readBdayCSV(filePath: string = "./bday_append_output/bdayinput-u60good(including Valid)_Final.csv"): Promise <any[]>{
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

  async wrtieU60BdayToDB() {
    const bdays = await this.readBdayCSV();
    const goodBdays = bdays.filter((c) => c["Date of Birth - Person (MM)"] !== "");
    for (const item of goodBdays) {
      const existingCustomer = await this.db.query(
        `SELECT id FROM accuzipcustomer WHERE wsid = $1 AND firstname = $2 AND lastname = $3`,
        [item["WSID"], item["First"], item["Last"]]
      );

      if (existingCustomer.rows.length > 0) {
        await this.db.query(
          `UPDATE accuzipcustomer SET mbdayyr = $1, mbdaymo = $2 WHERE wsid = $3 AND firstname = $4 and lastname = $5`,
          [item["Date of Birth - Person (MM)"], item[" Date of Birth - Person (YYYY)"], item["WSID"], item["First"], item["Last"]]
        )
      }
    }
  }

  async readBdays(
    filePath: string = "./bday_append_output/BdayOutput-231120 - 24,677_FINAL.csv",
  ): Promise<any[]> {
    const results: any = [];
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on(
          "data",
          (data: {
            "Shop Name": string;
            Software: string;
            CID: string;
            WCID: string;
            WSID: string;
            WCAID: string;
            "Last AuthDate": string;
            MBdayyr: string;
            MBdaymo: string;
            First: string;
            Last: string;
            Address: string;
            City: string;
            St: string;
            Zip: string;
            MD_Month: string;
            MD_Year: string;
          }) =>
            results.push({
              shopname: data["Shop Name"].trim(),
              software: data["Software"].trim(),
              cid: data["CID"].trim(),
                // data["Software"].trim() === "pro"
                //   ? data["CID"].trim()
                //     : data["WSID"] === "1056"
                //       ? data["CID"].trim() + "-" + data["WSID"]
                //       : data["WSID"] === "5009"
                //         ? data["CID"].trim() + '1071'
                //         : data["WSID"] === "5008"
                //           ? data["CID"].trim() + '1072'
                //           : data["CID"].trim() + data["WSID"],
                  // : data["CID"].trim() + data["WSID"],
              wcid: data["WCID"].trim(),
              wsid: data["WSID"].trim(),
              wcaid: data["WCAID"].trim(),
              authdate: data["Last AuthDate"]?.trim()??"",
              mbdaymo: data["MD_Month"].trim(),
              mbdayyr: data["MD_Year"].trim(),
            }),
        )
        .on("end", () => {
          resolve(results);
        })
        .on("error", (error) => {
          reject(error);
        });
    });
  }

  async writeAllBdayToAccuzipCustomer(filePath: string) {
    const bdays = await this.readBdays(filePath);
    const goodBdays = bdays.filter((c) => c.mbdaymo !== "" && c.mbdayyr !== "");
    let count = 0;
    for (const item of goodBdays) {
      const existingCustomer = await this.db.query(
        `SELECT id FROM accuzipcustomer WHERE id = $1`,
        [item.cid],
      );

      if (existingCustomer.rows.length > 0) {
        await this.db.query(
          `UPDATE accuzipcustomer SET mbdayyr = $1, mbdaymo = $2 WHERE id = $3
          `,
          [item.mbdayyr, item.mbdaymo, item.cid],
        );
      }
    }
  }

  async writeTekBdayToDB() {
    const bdays = await this.readBdays();
    const tekBdays = bdays.filter(
      (bday) => bday["Software"] === "Tek" && bday["MONTH"].trim() !== "",
    );

    for (const item of tekBdays) {
      const cid = item["CID"].trim();
      const shopId = item["SID"].trim();
      const byear = item["YEAR"].trim();
      const bmonth = item["MONTH"].trim();

      const existingCustomer = await this.db.query(
        `SELECT id FROM tekbday WHERE id = $1`,
        [cid],
      );

      if (existingCustomer.rows.length > 0) {
        await this.db.query(
          `UPDATE tekbday SET b_year = $1, b_month = $2, shopid = $3 WHERE id = $4`,
          [byear, bmonth, shopId, cid],
        );
      } else {
        await this.db.query(
          `INSERT INTO tekbday (id, shopid, b_year, b_month, b_day) VALUES ($1, $2, $3, $4, $5)`,
          [cid, shopId, byear, bmonth, ""],
        );
      }
    }
  }

  async writeProBdayToDB() {
    const bdays = await this.readBdays();
    const proBdays = bdays.filter(
      (bday) => bday["Software"] === "pro" && bday["MONTH"].trim() !== "",
    );

    for (const item of proBdays) {
      const cid = item["CID"].trim();
      const shopName = item["Shop Name"].trim();
      const byear = item["YEAR"].trim();
      const bmonth = item["MONTH"].trim();

      const existingCustomer = await this.db.query(
        `SELECT id FROM protractorbday WHERE id = $1`,
        [cid],
      );

      if (existingCustomer.rows.length > 0) {
        await this.db.query(
          `UPDATE protractorbday SET b_year = $1, b_month = $2 WHERE id = $3`,
          [byear, bmonth, cid],
        );
      } else {
        await this.db.query(
          `INSERT INTO protractorbday (id, shopname, b_year, b_month, b_day) VALUES ($1, $2, $3, $4, $5)`,
          [cid, shopName, byear, bmonth, ""],
        );
      }
    }
  }

  async writeSWBdayToDB() {
    const bdays = await this.readBdays();
    const swBdays = bdays.filter(
      (bday) => bday["Software"] === "SW" && bday["MONTH"] !== "",
    );

    for (const item of swBdays) {
      const cid = item["CID"].trim();
      const shopId = item["SID"].trim();
      const byear = item["YEAR"].trim();
      const bmonth = item["MONTH"].trim();

      const existingCustomer = await this.db.query(
        `SELECT id FROM shopwarebday WHERE id = $1`,
        [cid],
      );

      if (existingCustomer.rows.length > 0) {
        await this.db.query(
          `UPDATE shopwarebday SET b_year = $1, b_month = $2 WHERE id = $3`,
          [byear, bmonth, cid],
        );
      } else {
        await this.db.query(
          `INSERT INTO shopwarebday (id, shopid, b_year, b_month, b_day) VALUES ($1, $2, $3, $4, $5)`,
          [cid, shopId, byear, bmonth, ""],
        );
      }
    }
  }

  async writeNapBdayToDB() {
    const bdays = await this.readBdays();
    const napBdays = bdays.filter(
      (bday) => bday["Software"] === "nap" && bday["MONTH"] !== "",
    );

    for (const item of napBdays) {
      const cid = item["CID"].trim();
      const byear = item["MONTH"].trim();
      const bmonth = item["YEAR"].trim();

      await this.db.query(
        `UPDATE napcustomer SET year_ = $1, month_ = $2 WHERE id = $3`,
        [byear, bmonth, cid],
      );
    }
  }

  async writeMitBdayToDB() {
    const bdays = await this.readBdays();
    const mitBdays = bdays.filter(
      (bday) =>
        bday["Software"] === "mit" &&
        bday["Shop Name"] !== "St. Joseph Automotive & Diesel" &&
        bday["MONTH"].trim() !== "",
    );

    for (const item of mitBdays) {
      const cid = item["CID"].trim();
      const byear = item["YEAR"].trim();
      const bmonth = item["MONTH"].trim();

      await this.db.query(
        `UPDATE mitcustomer SET year_ = $1, month_ = $2 WHERE id = $3`,
        [byear, bmonth, cid],
      );
    }
  }
}
