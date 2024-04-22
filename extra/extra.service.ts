import { Injectable, Inject } from "@nestjs/common";
import { Pool } from "pg";
import * as fs from "fs";
import csv from "csv-parser";
import { allShopObject } from "../listcleanup/listcleanup.dedupe.service";
import { ListcleanupService } from "../listcleanup/listcleanup.service";
import { ListcleanupDedupeService } from "../listcleanup/listcleanup.dedupe.service";
import { BdayappendService } from "../bdayappend/bdayappend.service";
const csvWriter = require("csv-writer");
import path from "path";

type RCPACustomerObject = {
    shopName: string;
    customerId: string;
    wsid: string;
    lastAuthdate: string;
    latitude: string;
    logitude: string;
    distance: string;
    firstName: string;
    lastName: string;
    changedFirst: string;
    changedLast: string;
    originalAddress: string;
    addressLine: string;
    state: string;
    changedState: string;
    changedZipCode: string;
    changedCity: string;
    zipCode: string;
    deceased: string;
    changed: string;
}

@Injectable()
export class ExtraService {
    constructor(
        private readonly listCleanupService: ListcleanupService,
        private readonly listCleanupDedupeService: ListcleanupDedupeService,
        private readonly bdayAppendService: BdayappendService,
        @Inject("DB_CONNECTION") private readonly db: Pool
        ) {}

        async run() {
            const res = await this.db.query(`SELECT w.cust_count as custcount from wowcardshoptb as w where id = $1`, [1001]);

            console.log(res.rows[0].custcount);
        }

        // async createWowcardShops(allShops: allShopObject) {
        //     const storePosition = await this.bdayAppendService.getStorePosition("./accuzip_csv_files/Shop_position.csv");

        //     const tekmetricShops = await this.db.query(`SELECT * FROM tekshop`);

        //     const tekshops = allShops.tek.map(customer => {
        //         const shop = storePosition.find(c => Number(c.wsid) === customer.wowShopId);
        //         const shopinfor = tekmetricShops.rows.find(c => c.id === customer.shopId.toString());

        //         return {
        //             ...customer,
        //             latitude: shop?.latitude,
        //             longitude: shop?.logitude,
        //             phone: shopinfor.phone,
        //             email: shopinfor.email,
        //             website: shopinfor.website,
        //             address: shopinfor.address,
        //             connectedDate: shopinfor.connected_date
        //         }
        //     })

        //     const query = `
        //     INSERT INTO wowcardshoptb (id, wcaid, shopname, tek_shopid, sw_shopid, sw_tenantid, pro_connected_id, pro_api_key, software, email, phone, website, address_, connected_date, latitude_, longitude_, status_, limited_miles, contract_count)
        //     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        //     `

        //     for (const shop of tekshops) {
        //         const values = [
        //             shop.wowShopId.toString(),
        //             shop.chainId, 
        //             shop.shopName,
        //             shop.shopId,
        //             null, 
        //             null, 
        //             null, 
        //             null, 
        //             shop.software, 
        //             shop.email,
        //             shop.phone,
        //             shop.website,
        //             shop.address,
        //             shop.connectedDate,
        //             shop.latitude, 
        //             shop.longitude, 
        //             'Active', 
        //             50, 
        //             1800]

        //         await this.db.query(query, values);
        //     }
            
        // }

        async reasMattShops(filePath: string): Promise<any []> {
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
    

    // async readTekCustomer() {
    //     const res = await this.db.query(
    //         `SELECT * FROM tekcustomer9 WHERE shopid = '4839'`
    //     )

    //     return res.rows.map(customer => {
    //         return {
    //             id: customer.id,
    //             shopname: 'Atlanta Tires & Auto Repair',
    //             firstname: customer.firstname,
    //             lastname: customer.lastname,
    //             address: customer.address1,
    //             phone: customer.phone1
    //         }
        
    //         { id: "phone", title: "Phone Number" },
    //         ,
    //       });
      
    //       await writer.writeRecords(customers).then(() => {
    //         console.log("Done!");
    //       });

    // }

    async readAccuzipInforFromDB() {
        const res = await this.db.query(
            `
            SELECT
                a.id as id,
                a.wsid as wsid,
                a.wcaid as wcaid,
                a.software as software,
                a.shopname as shopname,
                a.authdate as authdate,
                a.status_ as status,
                a.email as email,
                a.changed_first as firstname,
                a.changed_last as lastname,
                a.changed_address as address,
                a.changed_state as state,
                a.changed_city as city,
                a.changed_zipcode as zipcode
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

         const newCustomers =  res.rows.map(customer => {
            return {
                wsid: customer.wsid,
                wcaid: customer.wcaid,
                software: customer.software,
                shopId: "",
                shopname: customer.shopname,
                customerId: customer.software !== "pro"
                                ? customer.wsid !== "1056"
                                    ? customer.id.trim().slice(0, -4)
                                    : customer.id.trim().slice(0, -5)
                                : customer.id.trim(),
                authdate: customer.authdate,
                firstname: customer.firstname,
                lastname: customer.lastname,
                email: customer.email,
                address: customer.address,
                status: customer.status,
                city: customer.city,
                state: customer.state,
                zipcode: customer.zipcode
            }
         })

         const writer = csvWriter.createObjectCsvWriter({
            path: path.resolve(__dirname, `./csv/AccuzipInputfile_RCPA.csv`),
            header: [
              { id: "wsid", title: "WSID" },
              { id: "wcaid", title: "WCAID" },
              { id: "software", title: "Software" },
              { id: "customerId", title: "CID" },
              { id: "shopname", title: "Shop Name" },
              { id: "authdate", title: "AuthDate" },
              { id: "firstname", title: "First" },
              { id: "lastname", title: "Last" },
              { id: "email", title: "Email" },
              { id: "address", title: "Address" },
              { id: "city", title: "City" },
              { id: "state", title: "St" },
              { id: "zipcode", title: "Zip" },
            ],
          });
      
          await writer.writeRecords(newCustomers.filter(c => c.status == 'V')).then(() => {
            console.log("Done!");
          });
    }

    async readCSV(filePath: string): Promise<RCPACustomerObject[]> {
        const results: any = [];
        return new Promise((resolve, reject) => {
          fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (data: {
                'Shop Name': string;
                WSID: string;
                'Last AuthDate': string;
                'Customer Id': string;
                Latitude: string;
                Longitude: string;
                Distance: string;
                First: string;
                Last: string;
                MBdayyr: string;
                MBdaymo: string;
                email: string;
                'Phone Number': string;
                Address: string;
                City: string;
                St: string;
                Zip: string;
                FirstName: string;
                LastName: string;
                AddressLine: string;
                CityLine: string;
                State: string;
                'Zip-Plus4': string;
                DECEASED: string;
            }) => results.push({
                shopName: data['Shop Name'].trim(),
                customerId: data['Customer Id'].trim(),
                wsid: data["WSID"].trim(),
                lastAuthdate: data["Last AuthDate"].trim(),
                latitude: data["Latitude"].trim(),
                logitude: data["Longitude"].trim(),
                distance: data["Distance"].trim(),
                firstName: data["First"].trim(),
                lastName: data["Last"].trim(),
                changedFirst: data["FirstName"].trim(),
                changedLast: data["LastName"].trim(),
                originalAddress: data["Address"].trim(),
                addressLine: data["AddressLine"].trim(),
                state: data["State"].trim(),
                changedCity: data["CityLine"].trim(),
                changedState: data["St"].trim(),
                changedZipCode: data["Zip-Plus4"].trim(),
                zipCode: data["Zip-Plus4"].trim(),
                deceased: data["DECEASED"].trim(),
                changed: data["AddressLine"].trim() !== "" && data["Address"].trim().toLowerCase() !== data["AddressLine"].trim().toLowerCase()
                            ? data["FirstName"].trim() !== "" && data["First"].trim().toLowerCase() !== data["FirstName"].trim().toLowerCase() 
                                ? data["LastName"].trim() !== "" && data["Last"].trim().toLowerCase() !== data["LastName"].trim().toLowerCase() 
                                    ? "FLA"
                                    : "FA"
                                : data["LastName"].trim() !== "" && data["Last"].trim().toLowerCase() !== data["LastName"].trim().toLowerCase() 
                                    ? "LA"
                                    : "A"
                            : data["FirstName"].trim() !== "" && data["First"].trim().toLowerCase() !== data["FirstName"].trim().toLowerCase() 
                                ? data["LastName"].trim() !== "" && data["Last"].trim().toLowerCase() !== data["LastName"].trim().toLowerCase() 
                                    ? "FL"
                                    : "F"
                                : data["LastName"].trim() !== "" && data["Last"].trim().toLowerCase() !== data["LastName"].trim().toLowerCase() 
                                    ? "L"
                                    : "No Changed"


            }))
            .on("end", () => {
              resolve(results);
            })
            .on("error", (error) => {
              reject(error);
            });
        });
      }

    async writeRCPASToDB() {
        const res = await this.readCSV("./file with new address/RCPA & Deceased-o48valid-2024-01 - 200,763_FINAL2.csv");

        for (let customer of res) {
            await this.db.query(
                `
                UPDATE accuzipcustomer
                SET changed_first = $1,
                    changed_last = $2,
                    changed_address = $3,
                    changed_state = $4,
                    changed_zipcode = $5,
                    ischanged = $6,
                    changed_city = $8
                WHERE accuzipcustomer.id = $7
                `,
                [
                    customer.changedFirst, 
                    customer.changedLast, 
                    customer.addressLine, 
                    customer.changedState, 
                    customer.changedZipCode, 
                    customer.changed, 
                    customer.customerId,
                    customer.changedCity
                ]
            );
        }

        // console.log(res1.rows)
    }

    async readRCPAAccuzipOutput(): Promise <{
        wsid: string;
        software: string;
        cid: string;
        status: string;
        latitue: number;
        logitude: number;
    } []> {
        const results: any = [];
        return new Promise((resolve, reject) => {
        fs.createReadStream("./file with new address/accuzip_rcpa export.csv")
            .pipe(csv())
            .on("data", (data: {
              wsid: string;
              software: string;
              cid: string;
              status_: string;
              latitude_: string;
              longitude_: string;  
            }) => results.push({
                wsid: data['wsid'].trim(),
                software: data['software'].trim(),
                cid: data['cid'].trim(),
                status: data['status_'].trim(),
                latitue: Number(data['latitude_'].trim()),
                logitude: Number(data['longitude_'].trim())
            }))
            .on("end", () => {
            resolve(results);
            })
            .on("error", (error) => {
            reject(error);
            });
        });
    }

    async writeRCPAAccuzipOutput() {
        const res= await this.readRCPAAccuzipOutput();

        for (let customer of res) {
            customer.cid = customer.software !== "pro"
                            ? customer.wsid !== "1056"
                                ? customer.cid.trim() + Number(customer.wsid)
                                : customer.cid.trim() + "-" + Number(customer.wsid)
                            : customer.cid.trim();
            
            await this.db.query(
                `
                UPDATE accuzipcustomer
                SET latitude_ = $1,
                    logitude_ = $2,
                    status_ = $3
                WHERE accuzipcustomer.id = $4
                `, [customer.latitue, customer.logitude, customer.status, customer.cid]
            )
        }
    }

    async readAccuzipCustomer(shops: allShopObject) {
         const tekShops = shops.nap;
         for ( let shop of tekShops) {
            const wsid = shop.wowShopId;
            const rawCustomers = await this.db.query(
                `SELECT 
                    c.id as id,
                    c.email as email,
                    c.phone1 as phone
                FROM napcustomer AS c
                WHERE c.shopname = '${shop.shopName}'
                `
            )

            for (let customer of rawCustomers.rows) {
                try {
                    await this.db.query(
                        `UPDATE accuzipcustomer
                         SET email = $1,
                             phone = $2
                         WHERE accuzipcustomer.id = $3
                         AND accuzipcustomer.wsid = '${wsid}'
                         `,
                        [customer.email, customer.phone, `${customer.id}${wsid}`] // Assuming string concatenation is needed
                    );
                } catch {
                    console.log(customer)
                }
            }
         }
    }
}
