import { Injectable } from '@nestjs/common';
import { TekService } from '../tek/tek.service';
import { customerObject } from '../tek/tek.service';

type rawCustomerObject = {
    id: string;
    firstName: string;
    lastName: string;
    address: string;
    address2: string;
    city: string;
    state: string;
    zip: string;
    authDate: Date;
    byear: string;
    bmonth: string;
    bday: string;
    shopName: string;
    shopPhone: string;
    shopEmail: string;
    software: string;
    wowShopId: number;
    chainId: number | null;
    shopId: number | string | null;
}

export type newCustomerBasedOnNameObject = {
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
}

@Injectable()
export class ListcleanupNameService {
    constructor(
        private readonly tekService: TekService
    ){}

    async cleanupOnName(customerData : customerObject []) : Promise <newCustomerBasedOnNameObject []>{
        const rawCustomers: rawCustomerObject[] = customerData.map((customer) => {    
            
            return {
                id: customer.id,
                firstName: customer.firstName || "",
                lastName: customer.lastName || "",
                address: customer.address || "",
                address2: customer.address2 || "",
                city: customer.city || "",
                state: customer.state || "",
                zip: customer.zip || "",
                authDate : customer.authDate,
                byear : customer.byear || "",
                bmonth : customer.bmonth || "",
                bday : customer.bday || "",
                shopName: customer.shopName || "",
                shopPhone: customer.shopPhone || "",
                shopEmail: customer.shopEmail || "",
                software: customer.software,
                wowShopId: customer.wowShopId,
                chainId: customer.chainId,
                shopId: customer.shopId,
            };
        });

        const newCustomersBasedOnName = rawCustomers.map((customer) => {
            let nameCode = {
                firstName : "",
                lastName: "",
                fullName: ""
            };

            let newCustomer = {...customer};

            const keywords = [
                "Associates",
                "Auto Body",
                "Autobody",
                "Center",
                "Company",
                "Corp",
                "Dept",
                "Enterprise",
                "Inc.",
                "Insurance",
                "Landscap",
                "LLC",
                "Motor",
                "Office",
                "Rental",
                "Repair",
                "Salvage",
                "Service",
                "Supply",
                "Tire",
                "Towing",
            ];

            if (/[-&,*^\/]|(\()|( and )|( OR )/i.test(newCustomer.firstName)) {
                newCustomer.firstName = newCustomer.firstName
                  .split(/[-&,*^\/]|(\()|( and )|( OR )/i)[0]
                  .trim();
                nameCode.firstName = "New Name";
                if (
                  /'\s|[@]/.test(newCustomer.firstName) ||
                  newCustomer.firstName.trim().split(/\s/).length > 2
                ) {
                  newCustomer.firstName = "";
                  nameCode.firstName = "Bad Name";
                } else if (
                  newCustomer.firstName.trim().length === 1 ||
                  newCustomer.firstName.trim().length === 0
                ) {
                  newCustomer.firstName = "";
                  nameCode.firstName = "Bad Name";
                } else if (
                  /\d/.test(newCustomer.firstName) ||
                  newCustomer.firstName.includes("'S ") ||
                  newCustomer.firstName.includes("'s ")
                ) {
                  newCustomer.firstName = "";
                  nameCode.firstName = "Bad Name";
                } else if (
                  keywords.some((keyword) => newCustomer.firstName.includes(keyword))
                ) {
                  newCustomer.firstName = "";
                  nameCode.firstName = "Bad Name";
                } else if (
                  /\bAuto\b/.test(newCustomer.firstName) ||
                  /\bCar\b/.test(newCustomer.firstName) ||
                  /\bInc\b/.test(newCustomer.firstName) ||
                  /\bTown\b/.test(newCustomer.firstName)
                ) {
                  newCustomer.firstName = "";
                  nameCode.firstName = "Bad Name";
                } else if (
                  newCustomer.firstName.trim().length > 12
                ) {
                  newCustomer.firstName = "";
                  nameCode.firstName = "Bad Name";
                }
              } else if (
                /'\s|[@]/.test(newCustomer.firstName) ||
                newCustomer.firstName.trim().split(/\s/).length > 2
              ) {
                newCustomer.firstName = "";
                nameCode.firstName = "Bad Name";
              } else if (
                newCustomer.firstName.trim().length === 1 ||
                newCustomer.firstName.trim().length === 0
              ) {
                newCustomer.firstName = "";
                nameCode.firstName = "Bad Name";
              } else if (
                /\d/.test(newCustomer.firstName) ||
                newCustomer.firstName.includes("'S ") ||
                newCustomer.firstName.includes("'s ")
              ) {
                newCustomer.firstName = "";
                nameCode.firstName = "Bad Name";
              } else if (
                keywords.some((keyword) => newCustomer.firstName.includes(keyword))
              ) {
                newCustomer.firstName = "";
                nameCode.firstName = "Bad Name";
              } else if (
                /\bAuto\b/.test(newCustomer.firstName) ||
                /\bCar\b/.test(newCustomer.firstName) ||
                /\bInc\b/.test(newCustomer.firstName) ||
                /\bTown\b/.test(newCustomer.firstName)
              ) {
                newCustomer.firstName = "";
                nameCode.firstName = "Bad Name";
              } else if (
                newCustomer.firstName.trim().length > 12
              ) {
                newCustomer.firstName = "";
                nameCode.firstName = "Bad Name";
              } else {
                nameCode.firstName = "";
              }
        
              if (/[-,*^\/]/.test(newCustomer.lastName)) {
                let splitName = newCustomer.lastName.split(/[-,*^\/]/);
                if (splitName[1].length === 0) {
                  newCustomer.lastName = splitName[0].trim();
                  if (newCustomer.lastName.includes(" OR ")) {
                    newCustomer.lastName = newCustomer.lastName.split(" OR ")[1];
                  }
                } else {
                  newCustomer.lastName = splitName[1].trim();
                  if (newCustomer.lastName.includes(" OR ")) {
                    newCustomer.lastName = newCustomer.lastName.split(" OR ")[1];
                  }
                }
                nameCode.lastName = "New Name";
                if (
                  /[@]|[&]|(\))/.test(newCustomer.lastName) ||
                  newCustomer.lastName.trim().length === 1
                ) {
                  newCustomer.lastName = "";
                  nameCode.lastName = "Bad Name";
                } else if (
                  /\d/.test(newCustomer.lastName) ||
                  newCustomer.lastName.includes("'S ") ||
                  newCustomer.lastName.includes("'s ") ||
                  newCustomer.lastName.split(".").length > 2
                ) {
                  newCustomer.lastName = "";
                  nameCode.lastName = "Bad Name";
                } else if (
                  newCustomer.lastName.trim().length > 14
                ) {
                  newCustomer.lastName = "";
                  nameCode.lastName = "Bad Name";
                }
              } else if (
                /[@]|[&]|(\))/.test(newCustomer.lastName) ||
                newCustomer.lastName.trim().length === 1 ||
                newCustomer.lastName.trim().length === 0
              ) {
                newCustomer.lastName = "";
                nameCode.lastName = "Bad Name";
              } else if (
                /\d/.test(newCustomer.lastName) ||
                newCustomer.lastName.includes("'S ") ||
                newCustomer.lastName.includes("'s ") ||
                newCustomer.lastName.split(".").length > 2
              ) {
                newCustomer.lastName = "";
                nameCode.lastName = "Bad Name";
              } else if (
                newCustomer.lastName.trim().length > 14
              ) {
                newCustomer.lastName = "";
                nameCode.lastName = "Bad Name";
              } else {
                nameCode.lastName = "";
              }
        
              if (
                nameCode.firstName == "Bad Name" ||
                nameCode.lastName == "Bad Name"
              ) {
                nameCode.fullName = "Bad Name";
              } else if (
                nameCode.firstName == "New Name" ||
                nameCode.lastName == "New Name"
              ) {
                nameCode.fullName = "New Name";
              } else {
                nameCode.fullName = "";
              }
        
              return {
                id: customer.id,
                oldFirstName: customer.firstName,
                oldLastName: customer.lastName,
                newFirstName: newCustomer.firstName,
                newLastName: newCustomer.lastName,
                nameCode: nameCode.fullName,
                byear: customer.byear,
                bmonth: customer.bmonth,
                bday: customer.bday,
                address: customer.address,
                address2: customer.address2,
                city: customer.city,
                state: customer.state,
                zip: customer.zip,
                shopName: customer.shopName,
                strAuthDate: customer.authDate? customer.authDate.toISOString().split("T")[0] : "",
                authDate: customer.authDate,
                software: customer.software,
                wowShopId: customer.wowShopId,
                chainId: customer.chainId,
                shopId: customer.shopId
              };
        })

        return newCustomersBasedOnName;
    }
}
