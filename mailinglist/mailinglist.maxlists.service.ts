import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import csv from "csv-parser";

@Injectable()
export class MailinglistMaxListService {
  async getMaxLists(
    filePath: string,
  ): Promise<{ shopid: string; values: string }[]> {
    const results: any = [];
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data: { WSID: string; maxOct: string; shop: string }) => {
          results.push({
            shopid: data["WSID"].trim(),
            values: Number(data["maxOct"].trim()),
            shop: data["shop"].trim(),
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

  async getDeltaLists(
    filePath: string,
  ): Promise<
    { shopId: string; shopName: string; deltaValue: number; contract: number }[]
  > {
    const results: any = [];
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on(
          "data",
          (data: { WSID: string; "Shop Name": string; Contract: string }) => {
            results.push({
              shopId: data["WSID"].trim(),
              shopName: data["Shop Name"].trim(),
              deltaValue: 0,
              contract:
                parseInt(data["Contract"].trim().replace(/,/g, ""), 10) || 0,
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
}
