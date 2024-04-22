import { Inject, Injectable, Logger } from "@nestjs/common";
import { Pool } from "pg";
import { ProApiService } from "./api.service";
import { ProCustomerService } from "./pro.writecustomer.service";
import { ProInvoiceService } from "./pro.writeinvoice.service";


@Injectable()
export class ProDataService {
    constructor(
        private readonly proApiService: ProApiService,
        private readonly proCustomerService: ProCustomerService,
        private readonly proInvoiceService: ProInvoiceService,
        @Inject("DB_CONNECTION") private readonly db: Pool,
    ) {}

    async generateDateGroup(startDateStr: string): Promise <string []> {
        const today = new Date();
        let startDate = new Date(startDateStr);
        let endDate = new Date();
        let numOfDays = 180;
        let DateGroup = new Array();

        while (startDate <= today) {
            endDate = new Date(startDate.getTime());
            endDate.setDate(startDate.getDate() + numOfDays);
            DateGroup.push(startDate.toISOString().split("T")[0]);
            startDate = endDate;
        }
    
        return DateGroup;
    }

    async fetchAndWriteChunkProData(startDateStr: string, shopName: string, gap: number, isUpdated: boolean, apiKey: string, id: string) {
        let startDate = new Date(startDateStr);
        let endDate = new Date();
        const today = new Date();
        endDate = new Date(startDate.getTime());
        endDate.setDate(startDate.getDate() + gap);

        if (endDate >= today) {
            endDate = new Date();
        }

        const endDateStr = endDate.toISOString().split("T")[0];
        const res = !isUpdated ? await this.proApiService.fetchProtractor(startDateStr, endDateStr) : await this.proApiService.fetchAllShopsProtractor(startDateStr, endDateStr, apiKey, id);

        console.log(res.CRMDataSet.ServiceItems.Item);
        // Writing the customer and invoices to DB.
        await this.proCustomerService.wrtieToDB(
            res.CRMDataSet.Contacts.Item
                ? res.CRMDataSet.Contacts.Item
                : null,
            shopName
        )

        await this.proInvoiceService.writeToDB(
            res.CRMDataSet.Invoices.Item
                ? res.CRMDataSet.Invoices.Item
                : null,
        )
    }
    
    async fetchAndWriteProData(startDateStr: string, gap: number, shopName: string, apiKey: string, id: string) {
        const dateGroup = await this.generateDateGroup(startDateStr);
        await Promise.all(
            dateGroup.map((date) => this.fetchAndWriteChunkProData(date, shopName, gap, true, apiKey, id))
        )
    }
}