import { Inject, Injectable } from "@nestjs/common";
import * as fs from "fs";
import csv from "csv-parser";
const csvWriter = require("csv-writer");
import path from "path";
import { Pool } from "pg";
import { AccuzipCalculateDistanceService } from "./accuzip.calculatedistance.service";

@Injectable()
export class AccuzipEnhandedService {
    constructor(
        private readonly accuzipCalculateDistanceService: AccuzipCalculateDistanceService,
        @Inject("DB_CONNECTION") private readonly db: Pool
    ) {}


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

    async getMissingUnitCustomers() {
        const res = await this.db.query(`SELECT * FROM accuzipcustomertb`)

        const errorNos = [`12.2`, `12.3`, `12.4`];

        return res.rows.filter(customer => errorNos.some(erroNo => customer.errorno.split(',').includes(erroNo)));
    }

    async saveMissingUnitCustomers() {
        const customers = await this.getMissingUnitCustomers();
        const rawCustomers = await this.readCSV("./accuzip_csv_files/cleanup-lists-allshop-export.csv");

        const idsToRemove = customers.map(item => item.id);

        const unitMissingCustomers = rawCustomers.filter(customer => idsToRemove.includes(customer.cid));

        console.log(unitMissingCustomers);

        const writer = csvWriter.createObjectCsvWriter({
            path: path.resolve(__dirname, `./csv/cleanup-lists-allshops-enhanced.csv`),
            header: [
                { id: "wsid", title: "WSID" },
                { id: "wcid", title: "WCID" },
                { id: "wcaid", title: "WCAID" },
                { id: "software", title: "Software" },
                { id: "sid", title: "SID" },
                { id: "cid", title: "CID" },
                { id: "shopname", title: "Shop Name" },
                { id: "authdate", title: "AuthDate" },
                { id: "mbdayyr", title: "MBDayYr" },
                { id: "mbdaymo", title: "MBDayMo" },
                { id: "tbdaymo", title: "TBDayMo" },
                { id: "first", title: "Old First" },
                { id: "last", title: "Old Last" },
                { id: "first", title: "First" },
                { id: "last", title: "Last" },
                { id: "address", title: "Address" },
                { id: "address2", title: "Address2" },
                { id: "city", title: "City" },
                { id: "state", title: "St" },
                { id: "zip", title: "Zip" },
            ],
          });
      
          await writer.writeRecords(unitMissingCustomers).then(() => {
            console.log("Done!");
          });
    }
}