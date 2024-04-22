import { Injectable, Inject } from '@nestjs/common';
import { ListcleanupNameService } from './listcleanup.name.service';
import { customerObject } from '../tek/tek.service';

type newCustomerBasedOnAddressObject = {
    id: string;
    oldFirstName: string;
    oldLastName: string;
    newFirstName: string;
    newLastName: string;
    nameCode: string;
    byear: string;
    bmonth: string;
    bday: string;
    address: string;
    address2: string;
    city: string;
    state: string;
    zip: string;
    shopName: string;
    strAuthDate: string;
    authDate: Date;
    software: string;
    wowShopId: number;
    chainId: number | null;
    shopId: number | string | null;
    isBadAddress: string;
}

@Injectable()
export class ListcleanupAddressService {
    constructor(
        private readonly listcleanupNameService: ListcleanupNameService,
    ){}

    async cleanupOnAddress(customerData : customerObject []) : Promise<newCustomerBasedOnAddressObject []> {
        const rawCustomers = await this.listcleanupNameService.cleanupOnName(customerData);
        const newCustomersBasedOnAddress = rawCustomers.map((customer) => {
            return {
                ...customer,
                isBadAddress: customer.address.trim() === "" && customer.address2.trim() === ""
                    ? "Bad Address"
                    : "",
            }
        })

        return newCustomersBasedOnAddress;
    }
}
