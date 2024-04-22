import { Inject, Injectable, Logger } from "@nestjs/common";
import { Pool } from "pg";
import { ConfigService } from "@nestjs/config";
import { SWApiService } from "./api.service";

export type SWDataRepairorder = {
    results: SWRepairOrderObject [];
    limit: number | null;
    limited: boolean | null;
    total_count: number | null;
    current_page: number | null;
    total_pages: number | null;
}

export type SWRepairOrderObject = {
    id: number;
    created_at: Date | null;
    updated_at: Date | null;
    number: number;
    odometer: number;
    odometer_out: number;
    state: string | null;
    customer_id: number;
    technician_id: number;
    advisor_id: number;
    vehicle_id: number;
    detail: string;
    preferred_contact_type: string | null;
    part_discount_cents: number | null;
    labor_discount_cents: number | null;
    shop_id: number;
    status_id: number;
    taxable: boolean;
    customer_source: string;
    supply_fee_cents: number;
    part_discount_percentage: number | null;
    labor_discount_percentage: number | null;
    fleet_po: null;
    start_at: Date | null;
    closed_at: Date | null;
    picked_up_at: Date | null;
    due_in_at: Date | null;
    due_out_at: Date | null;
    part_tax_rate: number | null;
    labor_tax_rate: number | null;
    hazmat_tax_rate: number | null;
    sublet_tax_rate: number | null;
    services: any[] | null;
    payments: any[] | null;
    integrator_tags: any[] | null;
    label: {
      text: string | null;
      color_code: string | null;
    };
  };

@Injectable()
export class SWRepairOrderService {
    private readonly logger = new Logger(SWRepairOrderService.name);

    constructor(
        private configService: ConfigService,
        private readonly apiService: SWApiService,
        @Inject("DB_CONNECTION") private readonly db: Pool,
    ) {}

    async fetchAndWriteRepairOrders(tenantId: number) {
        const res = await this.apiService.fetch<SWDataRepairorder>(`/tenants/${tenantId}/repair_orders`);
        const totalPages = res.total_pages;
        const pageArray = new Array(totalPages).fill(1);

        await Promise.all(
            pageArray.map(async (item, idx) => {
                const repairOrders = await this.fetchChunkRepairOrders(tenantId, idx + 1);
                await this.writeToDB(tenantId, repairOrders);
            })
        )
    }

    async fetchChunkRepairOrders(tenantId: number, currentPage: number): Promise<SWRepairOrderObject []> {
        try {
            console.log(currentPage);
            const res = await this.apiService.fetch<SWDataRepairorder>(`/tenants/${tenantId}/repair_orders?page=${currentPage}`)
            console.log(res.results);

            return res.results
        } catch (error) {
            const res = await this.apiService.fetch<SWDataRepairorder>(`/tenants/${tenantId}/repair_orders?page=${currentPage}`)

            return res.results
        }
    }

    async writeToDB(tenantId: number, swRepairOrders: SWRepairOrderObject []) {
        
        const repairorders = swRepairOrders.reduce(
            (result, repairorder) => ({
                ids: [...result.ids, repairorder.id],
                created_ats: [...result.created_ats, repairorder.created_at],
                updated_ats: [...result.updated_ats, repairorder.updated_at],
                numbers: [...result.numbers, repairorder.number],
                states: [...result.states, repairorder.state],
                customer_ids: [...result.customer_ids, repairorder.customer_id],
                part_discount_cents: [
                    ...result.part_discount_cents,
                    repairorder.part_discount_cents,
                ],
                labor_discount_cents: [
                    ...result.labor_discount_cents,
                    repairorder.labor_discount_cents,
                ],
                supply_fee_cents: [
                    ...result.supply_fee_cents,
                    repairorder.supply_fee_cents,
                ],
                part_discount_percentages: [
                    ...result.part_discount_percentages,
                    repairorder.part_discount_percentage,
                ],
                part_tax_rates: [...result.part_tax_rates, repairorder.part_tax_rate],
                labor_tax_rates: [
                    ...result.labor_tax_rates,
                    repairorder.labor_tax_rate,
                ],
                sublet_tax_rates: [
                    ...result.sublet_tax_rates,
                    repairorder.sublet_tax_rate,
                ],
                hazmat_tax_rates: [
                    ...result.hazmat_tax_rates,
                    repairorder.hazmat_tax_rate,
                ],
            }),
            {
                ids: [] as number[],
                created_ats: [] as (Date | null)[],
                updated_ats: [] as (Date | null)[],
                numbers: [] as (number | null)[],
                states: [] as (string | null)[],
                customer_ids: [] as (number | null)[],
                part_discount_cents: [] as (number | null)[],
                labor_discount_cents: [] as (number | null)[],
                supply_fee_cents: [] as number[],
                part_discount_percentages: [] as (number | null)[],
                part_tax_rates: [] as (number | null)[],
                labor_tax_rates: [] as (number | null)[],
                sublet_tax_rates: [] as (number | null)[],
                hazmat_tax_rates: [] as (number | null)[],
            },
        );
        await this.db.query(
            `
            INSERT INTO shopwarerepairorder (
              id,
              created_at,
              updated_at,
              number,
              state,
              customer_id,
              part_discount_cents,
              labor_discount_cents,
              supply_fee_cents,
              part_discount_percentage,
              part_tax_rate,
              labor_tax_rate,
              sublet_tax_rate,
              hazmat_tax_rate
            )
            SELECT * FROM UNNEST (
              $1::int[],
              $2::timestamp[],
              $3::timestamp[],
              $4::int[],
              $5::varchar(50)[],
              $6::bigint[],
              $7::int[],
              $8::int[],
              $9::int[],
              $10::int[],
              $11::float[],
              $12::float[],
              $13::float[],
              $14::float[]
            )
            ON CONFLICT (id)
            DO UPDATE
            SET
            id = EXCLUDED.id,
            created_at = EXCLUDED.created_at,
            updated_at = EXCLUDED.updated_at,
            number = EXCLUDED.number,
            state = EXCLUDED.state,
            customer_id = EXCLUDED.customer_id,
            part_discount_cents = EXCLUDED.part_discount_cents,
            labor_discount_cents = EXCLUDED.labor_discount_cents,
            supply_fee_cents = EXCLUDED.supply_fee_cents,
            part_discount_percentage = EXCLUDED.part_discount_percentage,
            part_tax_rate = EXCLUDED.part_tax_rate,
            labor_tax_rate = EXCLUDED.labor_tax_rate,
            sublet_tax_rate = EXCLUDED.sublet_tax_rate,
            hazmat_tax_rate = EXCLUDED.hazmat_tax_rate`,
            [
              repairorders.ids,
              repairorders.created_ats,
              repairorders.updated_ats,
              repairorders.numbers,
              repairorders.states,
              repairorders.customer_ids,
              repairorders.part_discount_cents,
              repairorders.labor_discount_cents,
              repairorders.supply_fee_cents,
              repairorders.part_discount_percentages,
              repairorders.part_tax_rates,
              repairorders.labor_tax_rates,
              repairorders.sublet_tax_rates,
              repairorders.hazmat_tax_rates,
            ],
        );
    }
}