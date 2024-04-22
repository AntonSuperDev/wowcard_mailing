import { Inject, Injectable } from "@nestjs/common";
import { customerObject } from "../bdayappend/bdayappend.service";
import * as fs from "fs";
import csv from "csv-parser";
import { Pool } from "pg";

@Injectable()
export class MailinglistWriteAccuzipToDBService {
  constructor(@Inject("DB_CONNECTION") private readonly db: Pool) {}

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
            crrt:  string;
          }) => {
            results.push({
              wsId: data["wsid"].trim(),
              // wsId: "5010",
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
              crrt: data["crrt"]?.trim() ?? ""
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

  async mit1056shops() {
    const res:any = await this.readCSV("./accuzip_csv_files/St._Joseph_Automotive_&_Diesel__db (1).csv")

    for ( let customer of res) {
      const id = customer.CustId;
      const email = customer.EmailAddress;
      const phone = customer.PhoneNum1.trim() == '' ? customer.PhoneNum4 : customer.PhoneNum4

      await this.db.query(
        `
        UPDATE accuzipcustomer
        SET email = $1,
            phone = $2
        WHERE accuzipcustomer.wsid = '1056'
        AND accuzipcustomer.id = $3
        `,
        [email, phone, `${id}-1056`]
      )
    }
  }

  async readAndWriteAccuzipCustomers() {
    // const res = await this.readAccuzipResult(
    //   "./accuzip_csv_files/cleanup-lists-o48good-export.csv",
    // );
    // const res = await this.readAccuzipResult(
    //   "./accuzip_csv_files/st joseph auto processed.csv",
    // );

    // const customers2 = await this.readCSV(
    //   "./accuzip_csv_files/St._Joseph_Automotive_&_Diesel__db (1).csv",
    // );

    // res.forEach((item) => {
    //   item.wsId = "1056";
    //   item.software = "mit";
    //   item.shopName = "St. Joseph Auto";
    //   item.authdate = new Date(
    //     customers2.filter(
    //       (customer) =>
    //         customer.CustId.trim() + customer.FirstName.trim() ===
    //         item.customerId.trim() + item.firstName.trim(),
    //     )[0]?.LastVisited || null,
    //   )
    //     .toISOString()
    //     .split("T")[0];

    //   console.log(item.authdate);
    //   item.customerId = item.customerId + "-";
    // });

    // console.log(res.length);

    let res = await this.readAccuzipResult(
      "./accuzip_csv_files/cleanup-lists-2024-03-export.csv",
    );

    console.log(res.length);

    const chunkSize = 300;
    const chunks: any[] = [];

    for (let i = 0; i < res.length; i += chunkSize) {
      const chunk = res.slice(i, i + chunkSize);
      chunks.push(chunk);
    }
    await Promise.all(chunks.map((chunk) => this.writeToDB(chunk)));
  }

  async writeToDB(customers: customerObject[]) {
    const accuzipCustomers = customers.reduce(
      (result, customer) => ({
        ids: [
          ...result.ids,
          customer.software !== "pro"
            ? customer.wsId !== "1056"
              ? customer.customerId.trim() + Number(customer.wsId)
              : customer.customerId.trim() + "-" + Number(customer.wsId)
            : customer.customerId.trim(),
        ],
        wsids: [...result.wsids, customer.wsId],
        wcaids: [...result.wcaids, customer.wcaId],
        softwares: [...result.softwares, customer.software],
        shopids: [...result.shopids, customer.shopId],
        shopnames: [...result.shopnames, customer.shopName],
        authdates: [...result.authdates, customer.authdate],
        mbdayyrs: [...result.mbdayyrs, customer.mbdayyr],
        mbdaymos: [...result.mbdaymos, customer.mbdaymo],
        firstnames: [...result.firstnames, customer.firstName],
        lastnames: [...result.lastnames, customer.lastName],
        addresses: [...result.addresses, customer.address],
        addresses2: [...result.addresses2, customer.address2],
        cities: [...result.cities, customer.city],
        states: [...result.states, customer.state],
        zips: [...result.zips, customer.zip],
        latitudes: [...result.latitudes, customer.latitude],
        logitudes: [...result.logitudes, customer.logitude],
        status: [...result.status, customer.status],
        crrts: [...result.crrts, customer.crrt]
      }),
      {
        ids: [] as string[],
        wsids: [] as string[],
        wcaids: [] as string[],
        softwares: [] as string[],
        shopids: [] as string[],
        shopnames: [] as string[],
        authdates: [] as string[],
        mbdayyrs: [] as string[],
        mbdaymos: [] as string[],
        firstnames: [] as string[],
        lastnames: [] as string[],
        addresses: [] as string[],
        addresses2: [] as string[],
        cities: [] as string[],
        states: [] as string[],
        zips: [] as string[],
        latitudes: [] as number[],
        logitudes: [] as number[],
        status: [] as string[],
        crrts: [] as string[]
      },
    );

    await this.db.query(
      `
            INSERT INTO accuzipcustomer (
            id,
            wsid,
            wcaid,
            software,
            shopname,
            authdate,
            mbdayyr,
            mbdaymo,
            firstname,
            lastname,
            address,
            address2,
            city,
            state,
            zip,
            latitude_,
            logitude_,
            status_,
            crrt
            )
            SELECT * FROM UNNEST (
            $1::varchar(150)[],
            $2::varchar(20)[],
            $3::varchar(20)[],
            $4::varchar(20)[],
            $5::varchar(50)[],
            $6::varchar(20)[],
            $7::varchar(20)[],
            $8::varchar(20)[],
            $9::varchar(20)[],
            $10::varchar(20)[],
            $11::varchar(50)[],
            $12::varchar(50)[],
            $13::varchar(50)[],
            $14::varchar(50)[],
            $15::varchar(30)[],
            $16::numeric [],
            $17::numeric [],
            $18::varchar(20)[],
            $19::varchar(20)[]
            )
            ON CONFLICT (id)
            DO UPDATE
            SET
            id = EXCLUDED.id,
            wsid = EXCLUDED.wsid,
            wcaid = EXCLUDED.wcaid,
            software = EXCLUDED.software,
            shopname = EXCLUDED.shopname,
            authdate = EXCLUDED.authdate,
            mbdayyr = EXCLUDED.mbdayyr,
            mbdaymo = EXCLUDED.mbdaymo,
            firstname = EXCLUDED.firstname,
            lastname = EXCLUDED.lastname,
            address = EXCLUDED.address,
            address2 = EXCLUDED.address2,
            city = EXCLUDED.city,
            state = EXCLUDED.state,
            zip = EXCLUDED.zip,
            latitude_ = EXCLUDED.latitude_,
            logitude_ = EXCLUDED.logitude_,
            status_ = EXCLUDED.status_,
            crrt = EXCLUDED.crrt
            `,
      [
        accuzipCustomers.ids,
        accuzipCustomers.wsids,
        accuzipCustomers.wcaids,
        accuzipCustomers.softwares,
        accuzipCustomers.shopnames,
        accuzipCustomers.authdates,
        accuzipCustomers.mbdayyrs,
        accuzipCustomers.mbdaymos,
        accuzipCustomers.firstnames,
        accuzipCustomers.lastnames,
        accuzipCustomers.addresses,
        accuzipCustomers.addresses2,
        accuzipCustomers.cities,
        accuzipCustomers.states,
        accuzipCustomers.zips,
        accuzipCustomers.latitudes,
        accuzipCustomers.logitudes,
        accuzipCustomers.status,
        accuzipCustomers.crrts
      ],
    );
  }
}
