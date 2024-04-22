import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { customerObject } from '../tek/tek.service';

@Injectable()
export class ProService {
    constructor(
        @Inject("DB_CONNECTION") private readonly db: Pool,
    ) {}

    async fetchCustomers(shopName: string, fixedShopName: string, wowShopId: number, chainId: number, software: string, period: number, isAll: boolean) : Promise<customerObject[]> {
        const res = await this.db.query(
            `
            SELECT DISTINCT c.id,
                to_char(c.creationtime, 'YYYY-MM-DD') as creationtime,
                to_char(c.lastmodifiedtime, 'YYYY-MM-DD') as lastmodifiedtime,
                c.firstname as firstName,
                c.middlename,
                c.lastname as lastName,
                c.shopname as shopName,
                c.suffix,
                c.addresstitle,
                c.addressstreet as address,
                c.addresscity as city,
                c.addressprovince as state,
                c.addresspostalcode as zip,
                c.addresscountry,
                c.company,
                c.phone1title,
                c.phone1,
                c.phone2title,
                c.phone2,
                c.emailtitle,
                c.email,
                c.marketingsource,
                c.note,
                c.nomessaging,
                c.noemail,
                c.nopostCard,
                firstVisit.invoicetime as firstVisitDate,
                lastVisit.invoicetime as authDate,
                AVG(i.grandtotal) as AROdollar,
                SUM(i.grandtotal) as TotalROdollars,
                COUNT(i.id) as TotalROs,
                b.b_year as byear,
                b.b_month as bmonth,
                b.b_day as bday
            FROM protractorcontact c
            LEFT JOIN (
                SELECT contactid, MIN(invoicetime) as invoicetime
                FROM protractorinvoice
                GROUP BY contactid
            ) firstVisit ON firstVisit.contactid = c.id
            LEFT JOIN (
                SELECT contactid, MAX(invoicetime) as invoicetime
                FROM protractorinvoice
                GROUP BY contactid
            ) lastVisit ON lastVisit.contactid = c.id
            LEFT JOIN protractorinvoice i ON i.contactid = c.id
            LEFT JOIN protractorbday b ON b.id = c.id
            WHERE (${isAll} OR (DATE(lastVisit.invoicetime) >= DATE(NOW() - INTERVAL '${period} MONTH')))
            AND c.shopname='${shopName}'
            GROUP BY c.id, firstVisit.invoicetime, lastVisit.invoicetime, b.b_year, b.b_month, b.b_day
            ORDER BY lastVisit.invoicetime;
            `,
        );

        return res.rows.map((row) => ({
            id: row.id,
            firstName: row.firstname,
            lastName: row.lastname,
            address: row.address,
            address2: "",
            city: row.city,
            state: row.state,
            zip: row.zip,
            authDate: new Date(row.authdate),
            byear: row.byear,
            bmonth: row.bmonth,
            bday: row.bday,
            shopName: fixedShopName,
            shopPhone: "",
            shopEmail: "",
            software: software,
            wowShopId: wowShopId,
            chainId: chainId,
            shopId: "",
        }))
    }
}
