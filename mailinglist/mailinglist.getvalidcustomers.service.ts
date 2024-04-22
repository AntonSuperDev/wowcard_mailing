import { Injectable, Inject } from "@nestjs/common";
import { Pool } from "pg";
import { customerObject } from "../bdayappend/bdayappend.service";

type BdayObject = {
  customerId: string;
  software: string;
  bYear: string;
  bMonth: string;
};

@Injectable()
export class MailinglistGetValidCustomerService {
  constructor(@Inject("DB_CONNECTION") private readonly db: Pool) {}

  async getAccuzipCustomers(): Promise<customerObject[]> {
    const res = await this.db.query(
      `
        SELECT 
         c.id as id,
         c.wsid as wsid,
         c.wcaid as wcaid,
         c.software as software,
         c.shopname as shopname,
         c.authdate as authdate,
         c.mbdayyr as mbdayyr,
         c.mbdaymo as mbdaymo,
         CASE 
           WHEN c.ischanged = 'FL' THEN c.changed_first
           WHEN c.ischanged = 'FA' THEN c.changed_first
           WHEN c.ischanged = 'F' THEN c.changed_first
           WHEN c.ischanged = 'FLA' THEN c.changed_first
           ELSE c.firstname
         END as firstname,
         CASE 
           WHEN c.ischanged = 'FL' THEN c.changed_last
           WHEN c.ischanged = 'L' THEN c.changed_last
           WHEN c.ischanged = 'FLA' THEN c.changed_last
           WHEN c.ischanged = 'LA' THEN c.changed_last
           ELSE c.lastname
         END as lastname,
         CASE 
           WHEN c.ischanged = 'FA' THEN c.changed_address
           WHEN c.ischanged = 'A' THEN c.changed_address
           WHEN c.ischanged = 'FLA' THEN c.changed_address
           WHEN c.ischanged = 'LA' THEN c.changed_address
           ELSE c.address
         END as address,
         CASE 
           WHEN c.ischanged = 'FA' THEN c.changed_city
           WHEN c.ischanged = 'A' THEN c.changed_city
           WHEN c.ischanged = 'FLA' THEN c.changed_city
           WHEN c.ischanged = 'LA' THEN c.changed_city
           ELSE c.city
         END as city,
         CASE 
           WHEN c.ischanged = 'FA' THEN c.changed_zipcode
           WHEN c.ischanged = 'A' THEN c.changed_zipcode
           WHEN c.ischanged = 'FLA' THEN c.changed_zipcode
           WHEN c.ischanged = 'LA' THEN c.changed_zipcode
           ELSE c.zip
         END as zip,
         CASE 
           WHEN c.ischanged = 'FA' THEN c.changed_state
           WHEN c.ischanged = 'A' THEN c.changed_state
           WHEN c.ischanged = 'FLA' THEN c.changed_state
           WHEN c.ischanged = 'LA' THEN c.changed_state
           ELSE c.state
         END as state,
         c.address2 as address2,
         c.status_ as status_,
         c.latitude_ as latitude_,
         c.logitude_ as logitude_,
         c.crrt as crrt
        FROM accuzipcustomer as c
      `,
    );

    return res.rows.map((customer) => {
      return {
        wsId: customer.wsid?.trim(),
        wcaId: customer.wcaid?.trim(),
        software: customer.software?.trim(),
        shopId: "",
        shopName: customer.shopname?.trim(),
        customerId:
          customer.software !== "pro"
            ? customer.wsid !== "1056"
              ? customer.id.trim().slice(0, -4)
              : customer.id.trim().slice(0, -5)
            : customer.id.trim(),
        authdate: customer.authdate,
        mbdayyr: customer.mbdayyr,
        mbdaymo: customer.mbdaymo === "0" ? "" : customer.mbdaymo,
        tbdaymo: "",
        firstName: customer.firstname,
        lastName: customer.lastname,
        address: customer.address,
        address2: customer.address2,
        city: customer.city,
        state: customer.state,
        zip: customer.zip,
        status: customer.status_,
        latitude: Number(customer.latitude_),
        logitude: Number(customer.logitude_),
        crrt: customer.crrt
      };
    });
  }

  async getBdays(): Promise<BdayObject[]> {
    const tekBdays = await this.db.query(
      `
        SELECT
            tb.id as id,
            tb.b_year as b_year,
            tb.b_month as b_month,
            'tek' as software
        FROM tekbday AS tb
        `,
    );

    const protractorBdays = await this.db.query(
      `
              SELECT
                  pb.id as id,
                  pb.b_year as b_year,
                  pb.b_month as b_month,
                  'pro' as software
              FROM protractorbday as pb
          `,
    );

    const shopwareBdays = await this.db.query(
      `
            SELECT
                sb.id as id,
                sb.b_year as b_year,
                sb.b_month as b_month,
                'sw' as software
            FROM shopwarebday as sb
        `,
    );

    const napBdays = await this.db.query(
      `
        SELECT
            n.id as id,
            n.year_ as b_year,
            n.month_ as b_month,
            'nap' as software
        FROM napcustomer as n
        WHERE n.month_ != ''
        OR n.month_ != '0'
        `,
    );

    const mitBdays = await this.db.query(
      `
        SELECT
            m.id as id,
            m.year_ as b_year,
            m.month_ as b_month,
            'mit' as software
        FROM mitcustomer as m
        WHERE m.month_ != ''
        OR m.month_ != '0'
        `,
    );

    const bdays = [
      ...tekBdays.rows,
      ...protractorBdays.rows,
      ...shopwareBdays.rows,
      ...napBdays.rows,
      ...mitBdays.rows,
    ];

    return bdays.map((item) => {
      return {
        customerId: item.id.trim(),
        software: item.software,
        bYear: item.b_year.trim(),
        bMonth: item.b_month.trim(),
      };
    });
  }

  async appendBdays(): Promise<customerObject[]> {
    const noBdayCustomers = await this.getAccuzipCustomers();
    // const bdays = await this.getBdays();

    // let day48ago = new Date();
    // day48ago.setMonth(day48ago.getMonth() - 60);

    const noBdayValidCustomers = noBdayCustomers.filter(
      (c) => c.status === "V",
    );

    // /////////////////////////////////--------- to match the accuzip and bday and updated accuzip database using bday. -----------//////////////

    // noBdayValidCustomers.forEach((customer) => {
    //   if (customer.mbdaymo.trim() === "") {
    //     const res = bdays.filter((c) => c.customerId === customer.customerId);
    //     if (res.length > 0) {
    //       customer.mbdaymo = res[0].bMonth;
    //       customer.mbdayyr = res[0].bYear;
    //     }
    //   }
    // });

    // await Promise.all(
    //   noBdayValidCustomers.map(async (customer) => {
    //     let idSuffix = "";
    //     if (customer.software === "pro") {
    //       // No suffix needed
    //     } else if (customer.wsId === "1056") {
    //       idSuffix = "-1056";
    //     } else {
    //       idSuffix = customer.wsId;
    //     }
    //     try {
    //       await this.db.query(
    //         `
    //         UPDATE accuzipcustomer SET mbdayyr=$1, mbdaymo=$2 WHERE id = $3
    //         `,
    //         [
    //           customer.mbdayyr,
    //           customer.mbdaymo,
    //           customer.customerId + idSuffix,
    //         ],
    //       );
    //     } catch (error) {
    //       // Handle errors, e.g., log them or throw
    //     }
    //   }),
    // );

    return noBdayValidCustomers;
  }
}
