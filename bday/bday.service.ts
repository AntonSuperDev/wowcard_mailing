import {Inject, Injectable } from '@nestjs/common';
import * as fs from "fs";
import csv from "csv-parser";
import path from "path";
import { Pool } from "pg";

@Injectable()
export class BdayService {

    constructor(@Inject("DB_CONNECTION") private readonly db: Pool) {}

    async readBdays(
        filePath: string = "./bday_append_output/BdayInput_Final_4.csv",
      ): Promise<{
        shopName: string;
        software: string;
        customerId: string;
        wsId: string;
        wcaId: string;
        authDate: string;
        mbdayyr: string;
        mbdaymo: string;
      }[]> {
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
                  shopName: data["Shop Name"].trim(),
                  software: data["Software"].trim(),
                  customerId: data["CID"].trim(),
                  wsId: data["WSID"].trim(),
                  wcaId: data["WCAID"].trim(),
                  authDate: data["Last AuthDate"]?.trim()??"",
                  mbdayyr: data["MD_Year"].trim(),
                  mbdaymo: data["MD_Month"].trim(),
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

    async updateBdayAccuzip() {
        const bdayAppendCustomers = await this.readBdays();
        for (const item of bdayAppendCustomers) {
            await this.db.query(
                `
                UPDATE accuzipcustomertb
                SET mbdayyr = $1,
                    mbdaymo = $2,
                    isbdayappend = true
                WHERE id = $3
                AND wsid = $4
                `,
                [item['mbdayyr'], item['mbdaymo'], item['customerId'], item['wsId']]
            )
        }
    }
}
