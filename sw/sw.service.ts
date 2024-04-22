import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { customerObject } from '../tek/tek.service';

@Injectable()
export class SwService {
    constructor(
        @Inject("DB_CONNECTION") private readonly db: Pool,
    ) {}

    async fetchCustomers(tanentId: number, shopId: number, wowShopId: number, chainId: number, software: string, period: number, isAll: boolean = false) : Promise<customerObject []> {
        const res = await this.db.query(
            `
            SELECT 
                (c.id) as id,
                (c.first_name) as firstName,
                (c.last_name) as lastName,
                (c.address) as address,
                (c.city) as city,
                (c.state) as state,
                (c.zip) as zip,
                (r.maxupdated_date) as authDate,
                b.b_year as byear,
                b.b_month as bmonth,
                b.b_day as bday,
                s.name as shopName,
                s.phone as shopPhone,
                s.email as shopEmail
            FROM shopwarecustomer c
            LEFT JOIN (
                SELECT customer_id, MAX(updated_at) as maxupdated_date
                FROM shopwarerepairorder
                GROUP BY customer_id
            ) as r ON c.id = r.customer_id
            LEFT JOIN shopwareshop s ON c.shopid = s.id
            LEFT JOIN shopwarebday b ON CAST(b.id AS INTEGER) = c.id
            WHERE (${isAll} OR (r.maxupdated_date >= DATE(NOW() - INTERVAL '${period} MONTH')))
            AND c.tenant = ${tanentId} and c.shopid = ${shopId}
            `
        );

        return res.rows.map(row => ({
            id: row.id,
            firstName: row.firstname,
            lastName: row.lastname,
            address: row.address,
            address2: "",
            city: row.city,
            state: row.state,
            zip: row.zip,
            authDate: new Date(row.authdate === null ? 0 : row.authdate),
            byear: row.byear,
            bmonth: row.bmonth,
            bday: row.bday,
            shopName: row.shopname,
            shopPhone: row.shopphone,
            shopEmail: row.shopemail,
            software: software,
            wowShopId: wowShopId,
            chainId: chainId,
            shopId: shopId,
        }));
    }
}
