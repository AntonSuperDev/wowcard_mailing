import { Inject, Injectable, Logger } from "@nestjs/common";
import { Pool } from "pg";

type ProInvoiceObject = {
    Header: {
      ID: string;
      CreationTime: Date | null;
      DeletionTime: Date | null;
      LastModifiedTime: Date | null;
      LastModifiedBy: string | null;
    };
    ID: string;
    Type: string | null;
    ScheduledTime: Date | null;
    PromisedTime: Date | null;
    InvoiceTime: Date | null;
    WorkOrderNumber: number | null;
    InvoiceNumber: number | null;
    PurchaseOrderNumber: string | null;
    ContactID: string | null;
    ServiceItemID: string | null;
    Technician: string | null;
    ServiceAdvisor: string | null;
    InUsage: number | null;
    OutUsage: number | null;
    Note: string | null;
    ServicePackages: {
      Item: any[] | null;
    };
    DeferredServicePackages: {
      Item: any[] | null;
    };
    Summary: {
      PartsTotal: number | null;
      LaborTotal: number | null;
      SubletTotal: number | null;
      NetTotal: number | null;
      OtherCharges: any[] | null;
      GrandTotal: number;
    };
    Payments: {
      Item: any[] | null;
    };
    OtherChargeCode: string | null;
    LocationID: string | null;
};

@Injectable()
export class ProInvoiceService {
    constructor(@Inject("DB_CONNECTION") private readonly db: Pool) {}

    async writeToDB(proInvoices: ProInvoiceObject []) {
        const invoices = proInvoices.reduce(
            (result, invoice) => ({
                ids: [...result.ids, invoice.ID],
                types: [...result.types, invoice.Type],
                scheduledtimes: [...result.scheduledtimes, invoice.ScheduledTime],
                promisedtimes: [...result.promisedtimes, invoice.PromisedTime],
                invoicetimes: [...result.invoicetimes, invoice.InvoiceTime],
                contactids: [...result.contactids, invoice.ContactID],
                serviceitemids: [...result.serviceitemids, invoice.ServiceItemID],
                partstotals: [...result.partstotals, invoice.Summary.PartsTotal],
                labortotals: [...result.labortotals, invoice.Summary.LaborTotal],
                sublettotals: [...result.sublettotals, invoice.Summary.SubletTotal],
                nettotals: [...result.nettotals, invoice.Summary.NetTotal],
                grandtotals: [...result.grandtotals, invoice.Summary.GrandTotal],
                locationids: [...result.locationids, invoice.LocationID],
            }),
            {
                ids: [] as string[],
                types: [] as (string | null)[],
                scheduledtimes: [] as (Date | null)[],
                promisedtimes: [] as (Date | null)[],
                invoicetimes: [] as (Date | null)[],
                contactids: [] as (string | null)[],
                serviceitemids: [] as (string | null)[],
                partstotals: [] as (number | null)[],
                labortotals: [] as (number | null)[],
                sublettotals: [] as (number | null)[],
                nettotals: [] as (number | null)[],
                grandtotals: [] as (number | null)[],
                locationids: [] as (string | null)[],
            },
          );
      
          await this.db.query(
            `
                INSERT INTO protractorinvoice (
                    id,
                    type,
                    scheduledtime,
                    promisedtime,
                    invoicetime,
                    contactid,
                    serviceitemid,
                    partstotal,
                    labortotal,
                    sublettotal,
                    nettotal,
                    grandtotal,
                    locationid
                )
                SELECT * FROM UNNEST (
                    $1::varchar(50)[],
                    $2::varchar(50)[],
                    $3::date[],
                    $4::date[],
                    $5::date[],
                    $6::varchar(50)[],
                    $7::varchar(50)[],
                    $8::float[],
                    $9::float[],
                    $10::float[],
                    $11::float[],
                    $12::float[],
                    $13::varchar(50)[]
                )
                ON CONFLICT (id)
                DO UPDATE
                SET
                id = EXCLUDED.id,
                type = EXCLUDED.type,
                scheduledtime = EXCLUDED.scheduledtime,
                promisedtime = EXCLUDED.promisedtime,
                invoicetime = EXCLUDED.invoicetime,
                contactid = EXCLUDED.contactid,
                serviceitemid = EXCLUDED.serviceitemid,
                partstotal = EXCLUDED.partstotal,
                labortotal = EXCLUDED.labortotal,
                sublettotal = EXCLUDED.sublettotal,
                nettotal = EXCLUDED.nettotal,
                grandtotal = EXCLUDED.grandtotal,
                locationid = EXCLUDED.locationid`,
            [
                invoices.ids,
                invoices.types,
                invoices.scheduledtimes,
                invoices.promisedtimes,
                invoices.invoicetimes,
                invoices.contactids,
                invoices.serviceitemids,
                invoices.partstotals,
                invoices.labortotals,
                invoices.sublettotals,
                invoices.nettotals,
                invoices.grandtotals,
                invoices.locationids,
            ],
        );
    }
}
