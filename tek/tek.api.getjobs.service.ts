import { Inject, Injectable, Logger } from "@nestjs/common";
import { Pool } from "pg";
import { TekmetricApiService } from "./api.service";

export type TekmetricJobObject = {
    id: number;
    repairOrderId: number | null;
    vehicleId: number | null;
    customerId: number;
    name: string | null;
    authorized: boolean | null;
    authorizedDate: Date | null;
    selected: boolean | null;
    technicianId: number | null;
    note: string | null;
    cannedJobId: number | null;
    jobCategoryName: string | null;
    partsTotal: number | null;
    laborTotal: number | null;
    discountTotal: number | null;
    feeTotal: number | null;
    subtotal: number | null;
    archived: boolean | null;
    createdDate: Date | null;
    completedDate: Date | null;
    updatedDate: Date | null;
    labor: any[] | null;
    parts: any[] | null;
    fees: any[] | null;
    discounts: any[] | null;
    laborHours: number | null;
    loggedHours: number | null;
    sort: number | null;
};

@Injectable()
export class TekmetricJobsService {
  private readonly logger = new Logger(TekmetricJobsService.name);
  constructor(
    private readonly tekmetricApiService: TekmetricApiService,
    @Inject("DB_CONNECTION") private readonly db: Pool,
  ) {}

  async fetchAndWriteJobs(shopId: number) {
    const result = await this.tekmetricApiService.fetch<{
        content: TekmetricJobObject[];
        totalPages: number;
        size: number;
    }>(`/jobs?shop=${shopId}`);

    const pageGroup = Math.floor((result.totalPages * result.size) / 1500) + 1;
    const pageArray = new Array(pageGroup).fill(1);

    await Promise.all(
        pageArray.map( async (page, idx) => {
          const jobs = await this.fetchChunkJobs(idx, shopId);
          await this.writeToDB(shopId, jobs)
        })
    )
  }

  async fetchChunkJobs(index: number, shopId: number): Promise <TekmetricJobObject []> {
    const result = await this.tekmetricApiService.fetch<{
        content: TekmetricJobObject []
    }>(`/jobs?page=${index}&size=1500&shop=${shopId}`);

    console.log(index);
    console.log(shopId)
    return result.content;
  }

  async writeToDB(shopId: number, tekJobs: TekmetricJobObject []) {
    const tableId = Math.floor(shopId / 500);

    const jobs = tekJobs.reduce(
        (result, job) => ({
          ids: [...result.ids, job.id],
          repairorderids: [...result.repairorderids, job.repairOrderId],
          vehicleids: [...result.vehicleids, job.vehicleId],
          customerids: [...result.customerids, job.customerId],
          names: [...result.names, job.name],
          authorized: [...result.authorized, job.authorized],
          authorizedDates: [...result.authorizedDates, job.authorizedDate],
          selected: [...result.selected, job.selected],
          notes: [...result.notes, job.note],
          cannedjobids: [...result.cannedjobids, job.cannedJobId],
          jobcategoryname: [...result.jobcategoryname, job.jobCategoryName],
          partstotals: [...result.partstotals, job.partsTotal],
          labortotals: [...result.labortotals, job.laborTotal],
          discounttotals: [...result.discounttotals, job.discountTotal],
          feetotals: [...result.feetotals, job.feeTotal],
          subtotals: [...result.subtotals, job.subtotal],
          archived: [...result.archived, job.archived],
          createddates: [...result.createddates, job.createdDate],
          updateddates: [...result.updateddates, job.updatedDate],
          laborhours: [...result.laborhours, job.laborHours],
          loggedHours: [...result.loggedHours, job.loggedHours],
          sorts: [...result.sorts, job.sort],
        }),
        {
          ids: [] as number[],
          repairorderids: [] as (number | null)[],
          vehicleids: [] as (number | null)[],
          customerids: [] as (number | null)[],
          names: [] as (string | null)[],
          authorized: [] as (boolean | null)[],
          authorizedDates: [] as (Date | null)[],
          selected: [] as (boolean | null)[],
          notes: [] as (string | null)[],
          cannedjobids: [] as (number | null)[],
          jobcategoryname: [] as (string | null)[],
          partstotals: [] as (number | null)[],
          labortotals: [] as (number | null)[],
          discounttotals: [] as (number | null)[],
          feetotals: [] as (number | null)[],
          subtotals: [] as (number | null)[],
          archived: [] as (boolean | null)[],
          createddates: [] as (Date | null)[],
          updateddates: [] as (Date | null)[],
          laborhours: [] as (number | null)[],
          loggedHours: [] as (number | null)[],
          sorts: [] as (number | null)[],
        },
      );
  
      await this.db.query(
        `
        INSERT INTO tekjob${tableId} (
          id,
          repairorderid,
          vehicleid,
          customerid,
          name,
          authorized,
          authorizedDate,
          selected,
          note,
          cannedjobid,
          jobcategoryname,
          partstotal,
          labortotal,
          discounttotal,
          feetotal,
          subtotal,
          archived,
          createddate,
          updateddate,
          laborhours,
          loggedhours,
          sort
        )
        SELECT * FROM UNNEST (
          $1::bigint[],
          $2::bigint[],
          $3::bigint[],
          $4::bigint[],
          $5::varchar(50)[],
          $6::boolean[],
          $7::date[],
          $8::boolean[],
          $9::varchar(100)[],
          $10::bigint[],
          $11::varchar(50)[],
          $12::bigint[],
          $13::int[],
          $14::int[],
          $15::int[],
          $16::int[],
          $17::boolean[],
          $18::date[],
          $19::date[],
          $20::float[],
          $21::float[],
          $22::int[]
        )
        ON CONFLICT (id)
        DO UPDATE
        SET
        id = EXCLUDED.id,
        repairorderid  = EXCLUDED.repairorderid,
        vehicleid  = EXCLUDED.vehicleid,
        customerid = EXCLUDED.customerid,
        name = EXCLUDED.name,
        authorized = EXCLUDED.authorized,
        authorizedDate = EXCLUDED.authorizedDate,
        selected = EXCLUDED.selected,
        note = EXCLUDED.note,
        cannedjobid = EXCLUDED.cannedjobid,
        jobcategoryname = EXCLUDED.jobcategoryname,
        partstotal = EXCLUDED.partstotal,
        labortotal = EXCLUDED.labortotal,
        discounttotal = EXCLUDED.discounttotal,
        feetotal = EXCLUDED.feetotal,
        subtotal = EXCLUDED.subtotal,
        archived = EXCLUDED.archived,
        createddate = EXCLUDED.createddate,
        updateddate = EXCLUDED.updateddate,
        laborhours = EXCLUDED.laborhours,
        loggedhours = EXCLUDED.loggedhours,
        sort = EXCLUDED.sort`,
        [
          jobs.ids,
          jobs.repairorderids,
          jobs.vehicleids,
          jobs.customerids,
          jobs.names,
          jobs.authorized,
          jobs.authorizedDates,
          jobs.selected,
          jobs.notes,
          jobs.cannedjobids,
          jobs.jobcategoryname,
          jobs.partstotals,
          jobs.labortotals,
          jobs.discounttotals,
          jobs.feetotals,
          jobs.subtotals,
          jobs.archived,
          jobs.createddates,
          jobs.updateddates,
          jobs.laborhours,
          jobs.loggedHours,
          jobs.sorts,
        ],
      );
  }
}