import { Inject, Injectable, Logger } from "@nestjs/common";
import { Pool } from "pg";
import { ConfigService } from "@nestjs/config";
import { SWApiService } from "./api.service";

export type SWDataCustomer = {
    results: SWCustomerObject [];
    limit: number | null;
    limited: boolean | null;
    total_count: number | null;
    current_page: number | null;
    total_pages: number | null;
};

export type SWCustomerObject = {
    id: number;
    created_at: Date | null;
    updated_at: Date | null;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    detail: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zip: string | null | number;
    marketing_ok: boolean | null;
    shop_ids: any[];
    origin_shop_id: number | null;
    customer_type: string | null;
    fleet_id: number | string | null;
    email: string | null;
    integrator_tags: any[] | null;
    phones: any[] | null;
  };
  

@Injectable()
export class SWCustomerService {
    private readonly logger = new Logger(SWCustomerService.name);

    constructor(
        private configService: ConfigService,
        private readonly apiService: SWApiService,
        @Inject("DB_CONNECTION") private readonly db: Pool,
    ) {}

    async fetchAndWriteCustomers(tenantId: number) {
        const res = await this.apiService.fetch<SWDataCustomer>(`/tenants/${tenantId}/customers`);
        const totalPages = res.total_pages;
        const pageArray = new Array(totalPages).fill(1);

        await Promise.all(
            pageArray.map(async (item, idx) => {
                const customers = await this.fetchChunkCustomers(tenantId, idx + 1);
                await this.writeToDB(tenantId, customers);
            })
        )
    }

    async fetchChunkCustomers(tenantId: number, currentPage: number): Promise <SWCustomerObject []> {
        try {
            const res = await this.apiService.fetch<SWDataCustomer>(`/tenants/${tenantId}/customers?page=${currentPage}`);

            return res.results;

        } catch (error) {
            const res = await this.apiService.fetch<SWDataCustomer>(`/tenants/${tenantId}/customers?page=${currentPage}`);

            return res.results;
        }
    }

    async writeToDB(tenantId: number, swCustomers: SWCustomerObject []) {
        
        const customers = swCustomers.reduce(
            (result, customer) => ({
            customerIds: [...result.customerIds, customer.id],
            createdAts: [...result.createdAts, customer.created_at],
            updatedAts: [...result.updatedAts, customer.updated_at],
            first_names: [...result.first_names, customer.first_name],
            last_names: [...result.last_names, customer.last_name],
            phones: [...result.phones, customer.phone],
            addresses: [...result.addresses, customer.address],
            cities: [...result.cities, customer.city],
            states: [...result.states, customer.state],
            zips: [...result.zips, customer.zip],
            customer_types: [...result.customer_types, customer.customer_type],
            okmarketings: [...result.okmarketings, customer.marketing_ok],
            shopids: [
                ...result.shopids,
                customer.shop_ids.length != 0 ? customer.shop_ids[0] : null,
            ],
            originshopids: [...result.originshopids, customer.origin_shop_id],
            tenants: [...result.tenants, tenantId],
            }),
            {
            customerIds: [] as number[],
            createdAts: [] as (Date | null)[],
            updatedAts: [] as (Date | null)[],
            first_names: [] as (string | null)[],
            last_names: [] as (string | null)[],
            phones: [] as (string | null)[],
            addresses: [] as (string | null)[],
            cities: [] as (string | null)[],
            states: [] as (string | null)[],
            zips: [] as (string | number | null)[],
            customer_types: [] as (string | null)[],
            okmarketings: [] as (boolean | null)[],
            shopids: [] as any[],
            originshopids: [] as (number | null)[],
            tenants: [] as number[],
            },
        );
    
        await this.db.query(
        `
            INSERT INTO shopwarecustomer (
                id,
                created_at,
                updated_at,
                first_name,
                last_name,
                phone,
                address,
                city,
                state,
                zip,
                customer_type,
                okmarketing,
                shopid,
                originshopid,
                tenant
            )
            SELECT * FROM UNNEST (
                $1::int[],
                $2::date[],
                $3::date[],
                $4::varchar(50)[],
                $5::varchar(50)[],
                $6::varchar(50)[],
                $7::varchar(50)[],
                $8::varchar(50)[],
                $9::varchar(50)[],
                $10::varchar(50)[],
                $11::varchar(50)[],
                $12::boolean[],
                $13::int[],
                $14::int[],
                $15::int[]
            )
            ON CONFLICT (id)
            DO UPDATE
            SET
            id = EXCLUDED.id,
            created_at = EXCLUDED.created_at,
            updated_at = EXCLUDED.updated_at,
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            phone = EXCLUDED.phone,
            address = EXCLUDED.address,
            city = EXCLUDED.city,
            state = EXCLUDED.state,
            zip = EXCLUDED.zip,
            customer_type = EXCLUDED.customer_type,
            okmarketing = EXCLUDED.okmarketing,
            shopid = EXCLUDED.shopid,
            originshopid = EXCLUDED.originshopid,
            tenant = EXCLUDED.tenant`,
        [
            customers.customerIds,
            customers.createdAts,
            customers.updatedAts,
            customers.first_names,
            customers.last_names,
            customers.phones,
            customers.addresses,
            customers.cities,
            customers.states,
            customers.zips,
            customers.customer_types,
            customers.okmarketings,
            customers.shopids,
            customers.originshopids,
            customers.tenants,
        ],
        ); 
    }
}