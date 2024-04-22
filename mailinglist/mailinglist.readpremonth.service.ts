import { Injectable } from '@nestjs/common';
import * as fs from "fs";
import csv from "csv-parser";

@Injectable()
export class MailinglistReadPrevMonthService {
    constructor(

    ) {}

    async readPrevMailingList(filePath: string) {
        const results: any[] = [];
        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .on('error', (error) => {
                    reject(error);
                })
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', () => {
                    resolve(results);
                });
        });
    }
}
