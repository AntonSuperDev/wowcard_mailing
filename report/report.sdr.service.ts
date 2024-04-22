import { Inject, Injectable, Logger } from "@nestjs/common";
import { Pool } from "pg";

type SDRObject = {

}

@Injectable()
export class ReportSDRListService {
    constructor (
        @Inject("DB_CONNECTION") private readonly db: Pool,
    ) {}

    async getTekOwners(shopId: number) {
        const res = await this.db.query(
            `
            SELECT
              e.id as id,
              e.firstname as firstName,
              e.lastname as lastName,
              e.email as email,
              e.address1 as address1,
              e.address2 as address2,
              e.city as city,
              e.state as state,
              e.zip as zip,
              e.fulladdress as fullAddress,
              e.streetaddress as streetAddress,
              e.shpid as shopId
            FROM tekemployee as e
            WHERE
              e.shpid = ${shopId}
              AND e.type = 'OWNER' 
            `,
        );
      
        return res.rows[0];
    }
}