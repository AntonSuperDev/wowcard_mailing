import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { customerObject } from '../tek/tek.service';

@Injectable()
export class NapService {
    constructor(
        @Inject("DB_CONNECTION") private readonly db: Pool,
    ) {}

    async fetchCustomers(shopName: string, wowShopId: number, chainId: number, software: string, period: number, isAll: boolean = false): Promise <customerObject[]> {
        const res = await this.db.query({
            text:`
                SELECT DISTINCT
                    c.id,
                    c.shopname as shopname,
                    c.lastvisited_date as authdate,
                    c.firstname as firstname,
                    c.lastname as lastname,
                    c.address1 as address,
                    c.address2 as address2,
                    c.city as city,
                    c.state_ as state,
                    c.zip as zip,
                    c.year_ as byear,
                    c.month_ as bmonth
                FROM napcustomer c
                WHERE ($2 OR (TO_DATE(c.lastvisited_date, 'MM/DD/YYYY') >= (CURRENT_DATE - INTERVAL '1 MONTH' * $3)))
                AND c.shopname = $1;
                `,
            values: [shopName, isAll, period]
            }
        );

        return res.rows.map((row) => {

            let tempDate: Date | number = new Date(row.authdate);
// Check if 'tempDate' is an invalid date
            if (isNaN(tempDate.getTime())) {
            // Handle the invalid date as appropriate
            // For example, you might choose to set it to null or leave it as an Invalid Date
            tempDate = 0; // Setting to null for invalid dates
            }

            return {
                id: row.id,
                firstName: row.firstname,
                lastName: row.lastname,
                address: row.address,
                address2: row.address2,
                city: row.city,
                state: row.state,
                zip: row.zip,
                authDate: new Date(tempDate),
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
            }
        })
    }
}
