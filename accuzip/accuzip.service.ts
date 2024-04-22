import { Inject, Injectable } from "@nestjs/common";
import * as fs from "fs";
import csv from "csv-parser";
import { Pool } from "pg";
import { AccuzipCalculateDistanceService } from "./accuzip.calculatedistance.service";

type AccuzipCustomerObject = {
    id: string;
    wcaId: string;
    software: string;
    shopId: string;
    wsId: string;
    shopName: string;
    authDate: Date;
    strAuthDate: string;
    mbdayyr: string;
    mbdaymo: string;
    tbdaymo: string;
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    status: string;
    dpv: string;
    errorNo: string [];
    errorNoDesc: string;
    moveDate: Date | null;
    nxi: string;
    dfl: string;
    dflDate: string;
    vacant: string;
    latitude: number;
    longitude: number;
    crrt: string;
    aptBrcd: string;
    aptUnitCD: string;
    acoa: string;
    acoaLevel: string;
    acoaDate: string;
    acoaNxi: string;
    acoaType: string;
}

type CountDetails = {
    wsId: string;
    software: string;
    shopname: string;
    totalBdaymo: number;
    u48bdaymo: number [];
    o48bdaymo: number [];
    totalTdaymo: number;
    u48tdaymo: number [];
    o48tdaymo: number [];
    u48validBday: number;
    u48validNoBday: number;
    o48validBday: number;
    o48validNoBday: number;
}

type CountMapObject = {
    [shopname: string]: CountDetails;
}

@Injectable()
export class AccuzipService {
    constructor(
        private readonly accuzipCalculateDistanceService: AccuzipCalculateDistanceService,
        @Inject("DB_CONNECTION") private readonly db: Pool
    ) {}

    // Read raw the Customers who were processed by enhanced Accuzip APi.
    // Remove the invalid Customers based on vacant = 'Y', Status_ != 'V' and nxi != '2'

    async readAccuzipCustomers(): Promise<AccuzipCustomerObject[]> {
        try {
            const res = await this.db.query(`SELECT * FROM accuzipcustomertb`);
            const errorNos = [`12.2`, `12.3`, `12.4`];
            const filterCustomers = res.rows.filter(customer => 
                customer.vacant !== 'Y' && customer.status_ === 'V' && customer.nxi !== '02'
            );
    
            const newFilteredCustomers =  filterCustomers.map(customer => ({
                id: customer.id,
                wcaId: customer.wcaid,
                software: customer.software,
                shopId: customer.shopid,
                wsId: customer.wsid,
                shopName: customer.shopname,
                strAuthDate: customer.authdate.toISOString().split("T")[0],
                authDate: customer.authdate,
                mbdayyr: customer.mbdayyr,
                mbdaymo: customer.mbdaymo,
                tbdaymo: customer.tbdayyr,
                firstName: customer.firstname,
                lastName: customer.lastname,
                address: customer.address_,
                city: customer.city,
                state: customer.state_,
                zip: customer.zip,
                status: customer.status_,
                dpv: customer.dpv,
                errorNo: customer.errorno.split(","),
                errorNoDesc: customer.errornodesc,
                moveDate: customer.movedate,
                nxi: customer.nxi,
                dfl: customer.dfl,
                dflDate: customer.dfldate,
                vacant: customer.vacant,
                latitude: customer.latitude,
                longitude: customer.longitude,
                crrt: customer.crrt,
                aptBrcd: customer.aptabrcd,
                aptUnitCD: customer.aptunitcd,
                acoa: customer.acoa,
                acoaLevel: customer.acoalevel,
                acoaDate: customer.acoadate,
                acoaNxi: customer.acoanxi,
                acoaType: customer.acoatype 
            }));

            
            return newFilteredCustomers.filter(customer => errorNos.some(erroNo => !customer.errorNo.includes(erroNo)) && (customer.dpv[0] === 'Y' || customer.dpv[0] === 'S'));
        } catch (error) {
            console.error('Failed to read Accuzip customers:', error);
            throw new Error('Database operation failed');
        }
    }

    async cleanBasedonName(): Promise<AccuzipCustomerObject []> {
        const noCleanCustomers = await this.readAccuzipCustomers();

        return noCleanCustomers.map(customer => {
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

              if (newCustomer.firstName.split(" ").length > 1) {
                newCustomer.firstName = newCustomer.firstName.split(" ")[0];
                if (newCustomer.firstName.trim() === '' || newCustomer.firstName.trim().length === 1) {
                  nameCode.firstName = "Bad Name"
                }
              }

              if (newCustomer.lastName.split(" ").length > 1) {
                newCustomer.lastName = newCustomer.lastName.split(" ")[newCustomer.lastName.split(" ").length - 1];
                if (newCustomer.lastName.trim() === '' || newCustomer.lastName.trim().length === 1) {
                  nameCode.lastName = "Bad Name"
                }
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
                ...newCustomer,
                nameCode: nameCode.fullName
              }
        }).filter(customer => customer.nameCode !== 'Bad Name')
    }

    // Deduplicated the Customers based on same firstname, lastname, address as well as chainId and wsid.
    // Limited the Customers based on authDate

    async deduplicate(dateAgo: number, isLimitedAuthdate: boolean, isUnder: boolean): Promise<AccuzipCustomerObject []> {
        const validAccuzipCustomers = await this.cleanBasedonName();
        const uniqueCustomersMap = new Map<string, AccuzipCustomerObject>();
        const sortedCustomers = validAccuzipCustomers.sort((a,b) => b.authDate?.getTime() - a.authDate?.getTime());
        sortedCustomers.forEach(customer => {
            const {
                firstName,
                lastName,
                address,
                wcaId,
                wsId,
                authDate
            } = customer;

            const key = wcaId !== '0'
                ? `${firstName.toLocaleLowerCase().trim()}-${lastName.toLocaleLowerCase()}-${address.toLocaleLowerCase()}-${wcaId}`
                : `${firstName.toLocaleLowerCase().trim()}-${lastName.toLocaleLowerCase()}-${address.toLocaleLowerCase()}-${wsId}`;
            
            if (!uniqueCustomersMap.has(key) || (uniqueCustomersMap.get(key)?.authDate ?? new Date('') < authDate)) {
                uniqueCustomersMap.set(key, customer);
            }
        });

        const agoDate = new Date();
        agoDate.setMonth(agoDate.getMonth() - dateAgo);

        return !isLimitedAuthdate
                    ? Array.from(uniqueCustomersMap.values())
                    : isUnder ? Array.from(uniqueCustomersMap.values()).filter(customer => customer.authDate > agoDate)
                              : Array.from(uniqueCustomersMap.values()).filter(customer => customer.authDate <= agoDate);
    }

    // Limit the Customers based on miles per shop

    async limitMiles(dateAgo: number, isLimitedAuthdate: boolean, isUnder: boolean) {
        const deduplicatedCustomers = await this.deduplicate(dateAgo, isLimitedAuthdate, isUnder);
        const shopsInfor = await this.db.query(`SELECT w.id as id, w.limited_miles as miles, w.latitude_ as latitude, w.longitude_ as longitude FROM wowcardshoptb AS w`);

        const limitedCustomers = await Promise.all(
            deduplicatedCustomers.reduce((tot: AccuzipCustomerObject[], customer: AccuzipCustomerObject) => {
                const customerLat = customer.latitude;
                const customerLon = customer.longitude;
                const shopId = customer.wsId;
                const shopLat = shopsInfor.rows.find(shop => shop.id === shopId).latitude;
                const shopLon = shopsInfor.rows.find(shop => shop.id === shopId).longitude;
                const shopMiles = shopsInfor.rows.find(shop => shop.id === shopId).miles;
                let distance = this.accuzipCalculateDistanceService.calculateDistance(customerLat, customerLon, shopLat, shopLon);

                return distance <= shopMiles ? [...tot, customer] : tot;
            }, [])
        )

        return limitedCustomers;
    }

    // Assign the Tday to Customers that don't have valid Bdays.

    async assignTday(dateAgo: number): Promise <AccuzipCustomerObject [][]> {
        let agoDate = new Date();
        agoDate.setMonth(agoDate.getMonth() - dateAgo);
        
        const limitedCustomers = await this.limitMiles(48, false, true);
        let u48validCustomers: AccuzipCustomerObject [] = [];
        let o48validCustomers: AccuzipCustomerObject [] = [];

        limitedCustomers.forEach(customer => new Date(customer.authDate) > agoDate ? u48validCustomers.push(customer) : o48validCustomers.push(customer));

        return [u48validCustomers, o48validCustomers].map(customers => {
            const sortedCustomers = customers.sort((a: AccuzipCustomerObject , b: AccuzipCustomerObject) => {
                const dateComparison = new Date(a.authDate).getTime() - new Date(b.authDate).getTime();

                if (dateComparison !== 0) return dateComparison;

                return Number(a.mbdaymo) - Number(b.mbdaymo);
            })

            const countsByShopAndMonth: Record <string, Record<string, number>> = {};
            
            sortedCustomers.forEach(customer => {
                let { wsId, mbdaymo } = customer;

                mbdaymo = Number(mbdaymo) ? Number(mbdaymo).toString(): '0';

                if(!(wsId in countsByShopAndMonth)) {
                    countsByShopAndMonth[wsId] = {};
                }

                countsByShopAndMonth[wsId][mbdaymo] = (countsByShopAndMonth[wsId][mbdaymo] || 0) + 1;
            });

            const averageByShop: Record<string, {average: number; remainder: number}> = {};

            for (const wsId in countsByShopAndMonth) {
                const counts = Object.values(countsByShopAndMonth[wsId]);
                const totalCustomers = counts.reduce((total, count) => total + count, 0);
                const average = Math.floor(totalCustomers / 12);
                const remainder = totalCustomers % 12;
                averageByShop[wsId] = { average, remainder };
            }

            const tbdayCounts: Record <string, Record <string, number>> = {};
            for (const wsId in countsByShopAndMonth) {
                tbdayCounts[wsId] = {};
                for (const mbdaymo in countsByShopAndMonth[wsId]) {
                  if (mbdaymo !== '0') {
                    const actualCount = countsByShopAndMonth[wsId][mbdaymo];
                    let { average, remainder } = averageByShop[wsId];
                    tbdayCounts[wsId][mbdaymo] = Math.max(0, average - actualCount);
                  }
                }
        
                let tbdaySum = Object.values(tbdayCounts[wsId]).reduce((sum, count) => sum + count, 0);
                averageByShop[wsId].remainder = countsByShopAndMonth[wsId]["0"] - tbdaySum;

                while (averageByShop[wsId].remainder < 0) {
                    let { average, remainder } = averageByShop[wsId];
                    average -= 1;
                    for (const mbdaymo in countsByShopAndMonth[wsId]) {
                      if (mbdaymo !== '0') {
                        const actualCount = countsByShopAndMonth[wsId][mbdaymo];
                        tbdayCounts[wsId][mbdaymo] = Math.max(0, average - actualCount);
                      }
                    }
          
                    let tbdaySum = Object.values(tbdayCounts[wsId]).reduce(
                      (sum, count) => sum + count,
                      0,
                    );
                    averageByShop[wsId].remainder =
                      countsByShopAndMonth[wsId]["0"] - tbdaySum;
                    averageByShop[wsId].average = average;
                }
            }

            for (const wsId in averageByShop) {
                const { average, remainder } = averageByShop[wsId];
                const months = Object.keys(countsByShopAndMonth[wsId]).slice(1);
                    if (remainder >= 0) {
                        months.sort((a, b) =>countsByShopAndMonth[wsId][a] - countsByShopAndMonth[wsId][b],
                    );

                    const lowestCountMonth = months.find((month) => countsByShopAndMonth[wsId][month] > 0);

                    if (lowestCountMonth) {
                        tbdayCounts[wsId][lowestCountMonth] += remainder;
                    }
                }
            }

            const results: Record<string, any>[] = [];

            for (const wsId in countsByShopAndMonth) {
                for (const mbdaymo in countsByShopAndMonth[wsId]) {
                if (mbdaymo !== '0') {
                        const actualCount = countsByShopAndMonth[wsId][mbdaymo] || 0;
                        const tbdayCount = tbdayCounts[wsId][mbdaymo] || 0; // Ensuring tbdayCount is defined and falls back to 0 if undefined
                        results.push({
                        id: wsId,
                        mbdaymo,
                        bdaymo: actualCount,
                        tbdaymo: tbdayCount,
                        all: actualCount + tbdayCount,
                        });
                    }
                }
            }

            const groupData: { [key: string]: any[] } = {};

            results.forEach((data) => {
                if (!groupData[data.id]) {
                    groupData[data.id] = [];
                }
                groupData[data.id].push(data);
            });

            for (const id in groupData) {
                groupData[id].sort((a, b) => a.bdaymo - b.bdaymo);
            }

            const customersWithEmptyMbdaymo = sortedCustomers.sort(
                (a, b) =>
                new Date(b.authDate).getTime() - new Date(a.authDate).getTime(),
            );

            let customerUpdateCount: { [key: string]: number } = {};
            Object.keys(groupData).forEach((id) => {
                const shopData = groupData[id];
                shopData.forEach((monthData) => {
                    if (!customerUpdateCount[monthData.mbdaymo]) {
                        customerUpdateCount = {
                            ...customerUpdateCount,
                            [monthData.mbdaymo]: 0,
                        };
                    }
                    for (let i = 0; i < customersWithEmptyMbdaymo.length; i++) {
                        let customer = customersWithEmptyMbdaymo[i];
                        if (
                            customer.wsId.trim() === id.trim() &&
                            Number(customer.mbdaymo) === 0 &&
                            Number(customer.tbdaymo) === 0
                          )
                        {
                            customer.tbdaymo = monthData.mbdaymo;
                            customerUpdateCount = {
                                ...customerUpdateCount,
                                [monthData.mbdaymo]: customerUpdateCount[monthData.mbdaymo] + 1,
                            };
                        }
                        if (customerUpdateCount[monthData.mbdaymo] >= monthData.tbdaymo) {
                            customerUpdateCount = {
                                ...customerUpdateCount,
                                [monthData.mbdaymo]: 0,
                            };
                            break;
                        }
                    }
                });
            });

            // console.log(customersWithEmptyMbdaymo)
        
            return customersWithEmptyMbdaymo;
        })
    }

    // Limit the count of Customers based on monthly account per shop.

    async limitForAllMonths(dateAgo: number) {
        // Fetch all necessary data at once
        const rawCustomers = await this.assignTday(dateAgo);
        const customers = rawCustomers.flat();
        const shops = await this.db.query(`SELECT id, contract_count, cust_count FROM wowcardshoptb`);
        let limitedCustomers: AccuzipCustomerObject [] = [];
    
        // Pre-calculate the date once
        const agoDate = new Date();
        agoDate.setDate(agoDate.getDate() - dateAgo);
    
        // Iterate through each month and each shop
        for (let month = 1; month <= 12; month++) {
            const bdayMo = month;
            const hdayMo = month < 7 ? month + 6 : month - 6;
    
            for (const shop of shops.rows) {
                let countForThisShopAndMonth = Math.floor(shop.cust_count * shop.contract_count / 12) + 1;
                const priorityGroup: AccuzipCustomerObject [][] = [[], [], [], [], [], [], [], []];
                console.log(shop.id);
    
                customers.forEach(customer => {
                    if (customer.wsId === shop.id) {
                        const customerAuthDate = new Date(customer.authDate);
                        const isU48 = customerAuthDate >= agoDate;
                        if (Number(customer.mbdaymo) === bdayMo && isU48) priorityGroup[0].push(customer);
                        if (Number(customer.mbdaymo) === bdayMo && !isU48) priorityGroup[1].push(customer);
                        if (Number(customer.mbdaymo) === hdayMo && isU48) priorityGroup[2].push(customer);
                        if (Number(customer.mbdaymo) === hdayMo && !isU48) priorityGroup[3].push(customer);
                        if (Number(customer.tbdaymo) === bdayMo && isU48) priorityGroup[4].push(customer);
                        if (Number(customer.tbdaymo) === bdayMo && !isU48) priorityGroup[5].push(customer);
                        if (Number(customer.tbdaymo) === hdayMo && isU48) priorityGroup[6].push(customer);
                        if (Number(customer.tbdaymo) === hdayMo && !isU48) priorityGroup[7].push(customer);
                    }
                });
    
                // Flatten the priority groups into a single list while maintaining order
                const orderedCustomers = priorityGroup.flat();
                limitedCustomers.push(...orderedCustomers.slice(0, countForThisShopAndMonth));
            }
        }
    
        return limitedCustomers;
    }

    async limitForSpecificMonth(dateAgo: number, month: number) {
        // Fetch all necessary data at once
        const rawCustomers = await this.assignTday(dateAgo);
        const customers = rawCustomers.flat();
        const shops = await this.db.query(`SELECT id, contract_count, cust_count FROM wowcardshoptb`);
        let limitedCustomers: AccuzipCustomerObject [] = [];
    
        // Pre-calculate the date once
        const agoDate = new Date();
        agoDate.setDate(agoDate.getDate() - dateAgo);
    
        // Iterate through each month and each shop
        
        const bdayMo = month;
        const hdayMo = month < 7 ? month + 6 : month - 6;

        for (const shop of shops.rows) {
            let countForThisShopAndMonth = Math.round(shop.cust_count * shop.contract_count / 12);
            const priorityGroup: AccuzipCustomerObject [][] = [[], [], [], [], [], [], [], []];
            console.log(shop.id);

            customers.forEach(customer => {
                if (customer.wsId === shop.id) {
                    const customerAuthDate = new Date(customer.authDate);
                    const isU48 = customerAuthDate >= agoDate;
                    if (Number(customer.mbdaymo) === bdayMo && isU48) priorityGroup[0].push(customer);
                    if (Number(customer.mbdaymo) === bdayMo && !isU48) priorityGroup[1].push(customer);
                    if (Number(customer.mbdaymo) === hdayMo && isU48) priorityGroup[2].push(customer);
                    if (Number(customer.mbdaymo) === hdayMo && !isU48) priorityGroup[3].push(customer);
                    if (Number(customer.tbdaymo) === bdayMo && isU48) priorityGroup[4].push(customer);
                    if (Number(customer.tbdaymo) === bdayMo && !isU48) priorityGroup[5].push(customer);
                    if (Number(customer.tbdaymo) === hdayMo && isU48) priorityGroup[6].push(customer);
                    if (Number(customer.tbdaymo) === hdayMo && !isU48) priorityGroup[7].push(customer);
                }
            });

            // Flatten the priority groups into a single list while maintaining order
            const orderedCustomers = priorityGroup.flat();
            limitedCustomers.push(...orderedCustomers.slice(0, countForThisShopAndMonth));
        }
    
        return limitedCustomers;
    }
    
    // Limit the count of Customers based on annual account per shop(Note!!! I am not using this function).

    // Generate the mailing Lists based on specific month

    async generateMailingLists(month: number, dateAgo: number) {
        const customers = await this.limitForSpecificMonth(dateAgo, month);
        const customersWithSpeificMonth = customers.filter(
            customer => 
                Number(customer.mbdaymo) === month ||
                Number(customer.mbdaymo) === month - (month < 7 ? -6 : 6) ||
                Number(customer.tbdaymo) === month - (month < 7 ? -6 : 6) ||
                Number(customer.tbdaymo) === month
        ).sort((a, b) => {
            const wsIDDiff = Number(a.wsId) - Number(b.wsId);

            if (wsIDDiff !== 0) {
                return wsIDDiff;
            } else {
                const mbdaymoDiff = Number(b.mbdaymo) - Number(a.mbdaymo);

                if (mbdaymoDiff !== 0) {
                    return mbdaymoDiff;
                } else {
                    const dateDiff =
                    new Date(b.authDate).getTime() - new Date(a.authDate).getTime();
                    return dateDiff;
                }
            }
        });

        const combinedArray = ([] as AccuzipCustomerObject []).concat(...Object.values(customersWithSpeificMonth));

        const updatedCustomers = combinedArray.map(customer => {
            if (Number(customer.mbdaymo) === month - (month < 7 ? -6 : 6)) {
                return {
                  ...customer,
                  ListName: `HDayList ${month}`,
                };
            } else if (Number(customer.mbdaymo) === month) {
                return {
                  ...customer,
                  ListName: `BDayList ${month}`,
                };
            } else if (
                Number(customer.tbdaymo) === month ||
                Number(customer.tbdaymo) === month - (month < 7 ? -6 : 6)
            ) {
                return {
                  ...customer,
                  ListName: `THDayList ${month}`,
                };
            } else {
                return {
                  ...customer,
                  ListName: "",
                };
            }
        })

        return updatedCustomers;
    }

    // Generate the mailing Lists based on specific month per shop

    async generateMailingListsPerShop(month: number, date48Ago: number) {
        const customers = await this.generateMailingLists(month, date48Ago);
        const wsIdListName = new Map<string, (AccuzipCustomerObject & {ListName: string})[]>();
        const keys = new Map<string, number>();
        customers.forEach(customer => {
            const {wsId, ListName, shopName }= customer;

            if (ListName != "") {
                const key = `${wsId}-${ListName}-${shopName}`;
                keys.set(key, (keys.get(key) || 0) + 1);
                if (!wsIdListName.has(key)) {
                    wsIdListName.set(key, []);
                }
                wsIdListName.get(key)?.push(customer);
            }
        });

        return Array.from(wsIdListName.values());
    }
}