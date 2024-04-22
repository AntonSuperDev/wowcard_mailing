import { Injectable , Inject} from '@nestjs/common';
import { Pool } from "pg";
import { TekmetricApiService } from '../tek/api.service';
import { TekmetricCustomerService } from '../tek/tek.api.getcustomers.service';
import { TekmetricJobsService } from '../tek/tek.api.getjobs.service';
import { ProDataService } from '../pro/pro.api.getdata.service';
import { SWApiService } from '../sw/api.service';
import { SWCustomerService } from '../sw/sw.api.getcustomers.service';
import { SWRepairOrderService } from '../sw/sw.api.getrepairorders.service';

export type allShopObject = {
    tek: {
      wowShopId: number;
      shopName: string;
      shopId: number;
      chainId: number;
      software: string;
    }[];
    sw: {
      wowShopId: number;
      shopName: string;
      shopId: number;
      tenantId: number;
      chainId: number;
      software: string;
    }[];
    pro: {
      wowShopId: number;
      shopName: string;
      fixedShopName: string;
      shopId: string;
      chainId: number;
      software: string;
    }[];
    mit: {
      wowShopId: number;
      shopName: string;
      shopId: string;
      chainId: number;
      software: string;
    }[];
    nap: {
      wowShopId: number;
      shopName: string;
      shopId: string;
      chainId: number;
      software: string;
    }[];
};

export type TekmetricCustomerObject = {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: any[];
    address: {
      id: number | null;
      address1: string | null;
      address2: string | null;
      city: string | null;
      state: string | null;
      zip: string | null;
    } | null;
    notes: string | null;
    customerType: {
      id: number;
      code: string | null;
      name: string | null;
    };
    contactFirstName: string | null;
    contactLastName: string | null;
    shopId: number;
    okForMarketing: boolean | null;
    createdDate: Date | null;
    updatedDate: Date | null;
    deletedDate: Date | null;
    birthday: Date | null;
  };

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
  

const protractorShops = [
    {
      apiKey: "9410fa3e72874f01b433f1025d9c03a6",
      id: "1614ec5b5c234361976ae718729a9119",
      shopName: "AG Automotive - OR",
    },
    {
      apiKey: "bec8dcdf55bb486282949b18aa530ae6",
      id: "6962e4ee2c0a4d189f4c521270c80a7b",
      shopName: "Highline – AZ",
    },
    {
      apiKey: "a65016d78b6c4eaca303bb78fdf97a66",
    id: "2bb37cdd6a1f40e893f27ee1cc7edb0a",
    shopName: "Toledo Autocare - B&L Whitehouse 3RD location",
    },
    {
      apiKey: "dd97566d7f44411e8f851c064e62c923",
      id: "3d5591b2efc94b73b7daac6525004764",
      shopName: "Toledo Autocare - Monroe Street 1ST location",
    },
    {
      apiKey: "c591bce054604c2a9eb903bd6b4b694e",
      id: "aad3590f79ac44aca4f16dc7cb1afedb",
      shopName: "Toledo Autocare - HEATHERDOWNS 2ND location",
    },
    {
      apiKey: "81ac6ecfd69d4cae9a26fe21073aa5fc",
      id: "3ed20563cfe8473f98c9ffa72870d327",
      shopName: "Sours  VA",
    },
  ];

@Injectable()
export class UpdatedbService {
    constructor(
        private readonly tekmetricApiService: TekmetricApiService,
        private readonly tekmetricCustomerService: TekmetricCustomerService,
        private readonly tekmetricJobService: TekmetricJobsService,
        private readonly proDataService: ProDataService,
        private readonly swApiService: SWApiService,
        private readonly swCustomerService: SWCustomerService,
        private readonly swRepairOrderService: SWRepairOrderService,
        @Inject("DB_CONNECTION") private readonly db: Pool,
    ) {}

    async updateDB(allShops: allShopObject, dateAgo: number) {
        const endDate: Date = new Date();
        const endDateStr: string = endDate.toISOString();
        endDate.setDate(endDate.getDate() - dateAgo);
        const startDateStr: string = endDate.toISOString();

        await Promise.all(
            allShops.tek.map((shop, idsx) => this.fetchAndWriteTekNewData(shop.shopId, startDateStr, endDateStr))
        )

        await this.fetchAndWriteProNewData(startDateStr);

        const swShops = [3065, 4186, 4979];
        await Promise.all(
            swShops.map(tenantId => this.fetchAndWriteSWNewData(tenantId, startDateStr))
        )
    }

    // Update Tekmetric Customers and Jobs Daily //

    async fetchAndWriteTekNewData(shopId: number, startDateStr: string, endDateStr: string) {
        const customers = await this.tekmetricApiService.fetch<{
            content:TekmetricCustomerObject[];
            totalPages: number;
            size: number;
        }>(`/customers?shop=${shopId}&updatedDateStart=${startDateStr}&updatedDateEnd=${endDateStr}`)

        const customerPageGroup = Math.floor((customers.totalPages * customers.size) / 300) + 1;
        const customerPageArray = new Array(customerPageGroup).fill(1);

        await Promise.all(
            customerPageArray.map(async (page, idx) => {
                const chunkCustomers = await this.fetchTekNewChunkCustomers(idx, shopId, startDateStr, endDateStr);
                await this.tekmetricCustomerService.writeToDB(shopId, chunkCustomers);
            })
        )

        const jobs = await this.tekmetricApiService.fetch<{
            content: TekmetricJobObject[];
            totalPages: number;
            size: number;
        }>(`/jobs?shop=${shopId}&updatedDateStart=${startDateStr}&updatedDateEnd=${endDateStr}`);

        const jobPageGroup = Math.floor((jobs.totalPages * jobs.size) / 300) + 1;
        const jobPageArray = new Array(jobPageGroup).fill(1);

        await Promise.all(
            jobPageArray.map(async (page, idx) => {
                const chunkJobs = await this.fetchTekNewChunkJobs(idx, shopId, startDateStr, endDateStr);
                await this.tekmetricJobService.writeToDB(shopId, chunkJobs);
            })
        )
    }

    async fetchTekNewChunkCustomers(index: number, shopId:  number, startDateStr: string, endDateStr: string): Promise<TekmetricCustomerObject[]>{
        const newChunkCustomers = await this.tekmetricApiService.fetch<{
            content: TekmetricCustomerObject []
        }>(`/customers?page=${index}&size=300&shop=${shopId}&updatedDateStart=${startDateStr}&updatedDateEnd=${endDateStr}`);

        return newChunkCustomers.content;
    }

    async fetchTekNewChunkJobs(index: number, shopId:  number, startDateStr: string, endDateStr: string): Promise <TekmetricJobObject []> {
        const result = await this.tekmetricApiService.fetch<{
            content: TekmetricJobObject [];
        }>(`/jobs?page=${index}&size=100&shop=${shopId}&updatedDateStart=${startDateStr}&updatedDateEnd=${endDateStr}`);

        return result.content;
    }

    // Update Protractor Customers and Jobs Daily //

    async fetchAndWriteProNewData(startDateStr: string) {
        await Promise.all(
            protractorShops.map(shop =>
                this.proDataService.fetchAndWriteProData(
                    startDateStr,
                    180,
                    shop.shopName,
                    shop.apiKey,
                    shop.id
                )
            )
        )
    }

    // Update SW Customers and Jobs daily //
    async fetchAndWriteSWNewData(tenantId: number, startDateStr: string ){
        const swCustomers = await this.swApiService.fetch<SWDataCustomer>(
            `/tenants/${tenantId}/customers?updated_after=${startDateStr}`,
        )
        const customerPageGroup = swCustomers.total_pages;
        const customerPageArray = new Array(customerPageGroup).fill(1);

        await Promise.all(
            customerPageArray.map(async (item, idx) => {
                const chunkCustomers = await this.fetchSWNewChunkCustomers(tenantId, idx + 1, startDateStr);
                await this.swCustomerService.writeToDB(tenantId, chunkCustomers);
            })
        );

        const swRepairOrders = await this.swApiService.fetch<SWDataRepairorder>(
            `/tenants/${tenantId}/repair_orders?updated_after=${startDateStr}`,
        );

        const repairOrderPageGroup = swRepairOrders.total_pages;
        const repairOrderPageArray = new Array(repairOrderPageGroup).fill(1);

        await Promise.all(
            repairOrderPageArray.map(async (item, idx) => {
                const repairOrders = await this.fetchSWNewChunkRepairOrders(
                    tenantId,
                    idx + 1,
                    startDateStr
                );

                await this.swRepairOrderService.writeToDB(tenantId, repairOrders)
            })
        );
    }

    async fetchSWNewChunkCustomers(
        tenantId: number,
        currentPage: number,
        startDateStr: string,
    ) : Promise<SWCustomerObject []> {
        const newSWChunkCustomers = await this.swApiService.fetch<SWDataCustomer>(
            `/tenants/${tenantId}/customers?page=${currentPage}&updated_after=${startDateStr}`,
        );

        return newSWChunkCustomers.results;
    }

    async fetchSWNewChunkRepairOrders(
        tenantId: number,
        currentPage: number,
        startDateStr: string
    ): Promise<SWRepairOrderObject []> {
        const newSWChunkRepairOrders = await this.swApiService.fetch<SWDataRepairorder>(
            `/tenants/${tenantId}/repair_orders?page=${currentPage}&updated_after=${startDateStr}`,
        )

        return newSWChunkRepairOrders.results;
    }

}
