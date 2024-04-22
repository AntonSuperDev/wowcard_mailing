import { Injectable, Inject, BadGatewayException } from "@nestjs/common";
import { Pool } from "pg";
import * as fs from "fs";
import csv from "csv-parser";
const csvWriter = require("csv-writer");
import path from "path";
import { BdayappendService } from "../bdayappend/bdayappend.service";
import { BdayAppendDistanceService } from "../bdayappend/bdayappend.distance.service";

@Injectable()
export class ExtraMailingService {
    constructor(
        private readonly bdayAppendService: BdayappendService,
        private readonly bdayAppendDistanceService: BdayAppendDistanceService,
        @Inject("DB_CONNECTION") private readonly db: Pool
    ) {}

    async readRCPACustomers(): Promise<{
        customerId: string;
        wsId: string;
        wcaId: string;
        software: string;
        shopName: string;
        authDate: string;
        firstName: string;
        lastName: string;
        address: string;
        city: string;
        state: string;
        zip: string;
        latitude: number;
        longitude: number;
    } []> {
        const res = await this.db.query(
            `
            SELECT * 
            FROM accuzipcustomer AS a
            WHERE a.ischanged = 'F'
            OR a.ischanged = 'L'
            OR a.ischanged = 'A'
            OR a.ischanged = 'FL'
            OR a.ischanged = 'FA'
            OR a.ischanged = 'LA'
            OR a.ischanged = 'FLA'
            `
        )
 
        return res.rows.filter( c => c.status_ === 'V').map(customer => {
            return {
                customerId: customer.id,
                wsId: customer.wsid,
                wcaId: customer.wcaid,
                software: customer.software,
                shopName: customer.shopname,
                authDate: customer.authdate,
                firstName: customer.changed_first,
                lastName: customer.changed_last,
                address: customer.changed_address,
                city: customer.changed_city,
                state: customer.changed_state,
                zip: customer.changed_zipcode,
                latitude: customer.latitude_,
                longitude: customer.logitude_
            }
        }) 
    }

    async list25mile(shopPosition: string) {
        const res = await this.readRCPACustomers();
        const storePosition = await this.bdayAppendService.getStorePosition(
            shopPosition
        );

        const newCustomers = await Promise.all(
            res.map(customer => {
                const customerLat = customer.latitude;
                const customerLon = customer.longitude;

                if (customer.wsId === `5014`) {
                    customer.wsId = `1076`
                }

                if (customer.wsId === `5013`) {
                    customer.wsId = `1075`
                }

                if (customer.wsId === `5012`) {
                    customer.wsId = `1074`
                }

                if (customer.wsId === `5011`) {
                    customer.wsId = `1073`
                }

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
                        shopLon
                    )

                    if (shop.wsid !== `1008` && shop.wsid !== `1054` && shop.wsid !== `1072` && distance <= 50) {
                        isMailable = true;
                    }

                    if ( (shop.wsid === `1008` || shop.wsid === `1054` || shop.wsid === `1072`) && distance <= 25) {
                        isMailable = true;
                    }
                }

                return {
                    ...customer,
                    shopId: '',
                    wcId: '',
                    distace: distance != null ? distance : null,
                    isMailable: isMailable,
                    shopname: shop ? shop.name: ""
                }
            })
        )

        return newCustomers
    }

    async saveRCPSMailingList(shopPosition: string) {
        const customer = await this.list25mile(shopPosition);

        const shopsId = [
            
        ]

        console.log(customer.filter(c => c.isMailable === true));

        const writer = csvWriter.createObjectCsvWriter({
            path: path.resolve(__dirname, `./csv/mailinglist_RCPA.csv`),
            header: [
                { id: "shopName", title: "Shop Name" },
                { id: "software", title: "Software" },
                { id: "shopId", title: "SID" },
                { id: "customerId", title: "CID" },
                { id: "wcId", title: "WCID" },
                { id: "wsId", title: "WSID" },
                { id: "wcaId", title: "WCAID" },
                { id: "authDate", title: "Last AuthDate" },
                { id: "latitude", title: "Latitude" },
                { id: "longitude", title: "Longitude" },
                { id: "distance", title: "Distance" },
                // { id: "isMailable", title: "IsMailable" },
                // { id: "mbdayyr", title: "MBdayYr" },
                // { id: "mbdaymo", title: "MBdayMo" },
                // { id: "tbdaymo", title: "TBdayMo" },
                { id: "firstName", title: "First" },
                { id: "lastName", title: "Last" },
                { id: "address", title: "Address" },
                // { id: "address2", title: "Address2" },
                { id: "city", title: "City" },
                { id: "state", title: "St" },
                { id: "zip", title: "Zip" },
            ],
          });
      
          await writer.writeRecords(customer.filter(c => c.isMailable === true)).then(() => {
            console.log("Done!");
          });

    }
}
