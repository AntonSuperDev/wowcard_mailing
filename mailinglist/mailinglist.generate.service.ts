import { Injectable } from "@nestjs/common";
import { MailinglistCountsService } from "./mailinglist.counts.service";
import { MailinglistMaxListService } from "./mailinglist.maxlists.service";
import { customerObject } from "../bdayappend/bdayappend.service";

interface CountDetails {
  wsId: string;
  software: string;
  shopname: string;
  totalBdaymo: number;
  bdaymo: number[];
  totalTdaymo: number;
  tdaymo: number[];
  u48validBday: number;
  u48validNoBday: number;
  o48validBday: number;
  o48validNoBday: number;
}

interface OtherCountDetailes {
  wsId: string;
  software: string;
  shopname: string;
  totalBdaymo: number;
  u48bdaymo: number[];
  o48bdaymo: number[];
  totalTdaymo: number;
  u48tdaymo: number[];
  o48tdaymo: number[];
  u48validBday: number;
  u48validNoBday: number;
  o48validBday: number;
  o48validNoBday: number;
}

type CountMap = {
  [shopname: string]: CountDetails;
};

type OtherCountMap = {
  [shopname: string]: OtherCountDetailes;
};

@Injectable()
export class MailinglistGenerateService {
  constructor(
    private readonly mailinglistCountsService: MailinglistCountsService,
    private readonly mailinglistMaxListService: MailinglistMaxListService,
  ) {}

  async limitBasedonAnnaulCountsFocusAuthdate(
    stPath: string,
    storePath: string,
    limitPath: string,
  ) {
    let rawCustomers = await this.mailinglistCountsService.assignTBday(
      stPath,
      storePath,
    );

    console.log(rawCustomers.length);

    const customers = rawCustomers.flat().sort((a, b) => {
      const wsIDDiff = Number(a.wsId) - Number(b.wsId);
      if (wsIDDiff !== 0) {
        return wsIDDiff;
      } else {
        const dateDiff =
          new Date(a.authdate).getTime() - new Date(b.authdate).getTime();

        if (dateDiff !== 0) {
          return dateDiff;
        } else {
          const mbdaymoDiff = Number(b.mbdaymo) - Number(a.mbdaymo);
          return mbdaymoDiff;
        }
      }
    });

    const annualCounts = (
      await this.mailinglistMaxListService.getDeltaLists(limitPath)
    ).slice(0);

    const counts: OtherCountMap = {};
    let date48Ago = new Date();
    date48Ago.setMonth(date48Ago.getMonth() - 48);
    for (const item of customers) {
      if (!counts[item.wsId]) {
        counts[item.wsId] = {
          wsId: item.wsId,
          software: item.software,
          shopname: item.shopname,
          totalBdaymo: 0,
          u48bdaymo: Array(12).fill(0),
          o48bdaymo: Array(12).fill(0),
          totalTdaymo: 0,
          u48tdaymo: Array(12).fill(0),
          o48tdaymo: Array(12).fill(0),
          u48validBday: 0,
          u48validNoBday: 0,
          o48validBday: 0,
          o48validNoBday: 0,
        };
      }

      if (Number(item.mbdaymo) !== 0) {
        counts[item.wsId].totalBdaymo++;
        if (new Date(item.authdate) >= date48Ago) {
          counts[item.wsId].u48bdaymo[parseInt(item.mbdaymo) - 1]++;
          counts[item.wsId].u48validBday++;
        } else {
          counts[item.wsId].o48validBday++;
          counts[item.wsId].o48bdaymo[parseInt(item.mbdaymo) - 1]++;
        }
      }

      if (Number(item.tbdaymo) !== 0) {
        counts[item.wsId].totalTdaymo++;
        if (new Date(item.authdate) >= date48Ago) {
          counts[item.wsId].u48tdaymo[parseInt(item.tbdaymo) - 1]++;
          counts[item.wsId].u48validNoBday++;
        } else {
          counts[item.wsId].o48validNoBday++;
          counts[item.wsId].o48tdaymo[parseInt(item.tbdaymo) - 1]++;
        }
      }
    }

    let limitedCustomers: any[] = [];

    for (const wsId in counts) {
      let shopData = counts[wsId];
      const contractCounts = annualCounts.filter(
        (item) => item.shopId === wsId,
      );

      const bdayCustomersForShop = customers.filter(
        (c) => c.wsId === wsId && Number(c.mbdaymo) !== 0,
      );

      const tdayCustomersForShop = customers.filter(
        (c) => c.wsId === wsId && Number(c.tbdaymo) !== 0,
      );

      if (contractCounts[0].contract === 0) {
        contractCounts[0].deltaValue = 0;
      } else {
        contractCounts[0].deltaValue =
          shopData.totalBdaymo +
          shopData.totalTdaymo -
          contractCounts[0].contract;
      }

      if (contractCounts[0].deltaValue <= 0) {
        limitedCustomers.push(bdayCustomersForShop);
        limitedCustomers.push(tdayCustomersForShop);

        continue;
      }

      if (
        0 < contractCounts[0].contract &&
        contractCounts[0].contract <= shopData.u48validBday
      ) {
        let deductedCount = shopData.u48validBday - contractCounts[0].contract;
        shopData.u48tdaymo.fill(0);
        shopData.o48bdaymo.fill(0);
        shopData.o48tdaymo.fill(0);
        while (1) {
          let deductedForMonth =
            deductedCount >= 12 ? Math.floor(deductedCount / 12) : 1;
          for (let i = 0; i < 12; i++) {
            if (deductedCount <= 0) {
              break;
            }

            if (shopData.u48bdaymo[i] > deductedForMonth) {
              shopData.u48bdaymo[i] = shopData.u48bdaymo[i] - deductedForMonth;
              deductedCount = deductedCount - deductedForMonth;
            } else {
              deductedCount = deductedCount - shopData.u48bdaymo[i];
              shopData.u48bdaymo[i] = 0;
            }
          }

          if (deductedCount <= 0) {
            break;
          }
        }
      } else if (
        contractCounts[0].contract > shopData.u48validBday &&
        contractCounts[0].contract <=
          shopData.u48validBday + shopData.u48validNoBday
      ) {
        shopData.o48bdaymo.fill(0);
        shopData.o48tdaymo.fill(0);
        let deductedCount =
          shopData.u48validBday +
          shopData.u48validNoBday -
          contractCounts[0].contract;
        let freq = Array(12).fill(0);
        for (let i = 0; i < 12; i++) {
          freq[i] = shopData.u48tdaymo[i] / shopData.u48validNoBday;
        }
        while (1) {
          for (let i = 0; i < 12; i++) {
            if (deductedCount <= 0) {
              break;
            }

            let deductedForMonth = Math.floor(deductedCount * freq[i]) + 1;
            if (shopData.u48tdaymo[i] > deductedForMonth) {
              shopData.u48tdaymo[i] = shopData.u48tdaymo[i] - deductedForMonth;
              deductedCount = deductedCount - deductedForMonth;
            } else {
              deductedCount = deductedCount - shopData.u48tdaymo[i];
              shopData.u48tdaymo[i] = 0;
            }
          }

          if (deductedCount <= 0) {
            break;
          }
        }
      } else if (
        contractCounts[0].contract <=
          shopData.u48validBday +
            shopData.u48validNoBday +
            shopData.o48validBday &&
        contractCounts[0].contract >
          shopData.u48validBday + shopData.u48validNoBday
      ) {
        let deductedCount =
          shopData.u48validBday +
          shopData.u48validNoBday +
          shopData.o48validBday -
          contractCounts[0].contract;
        shopData.o48tdaymo.fill(0);
        while (1) {
          let deductedForMonth =
            deductedCount >= 12 ? Math.floor(deductedCount / 12) : 1;
          for (let i = 0; i < 12; i++) {
            if (deductedCount <= 0) {
              break;
            }

            if (shopData.o48bdaymo[i] > deductedForMonth) {
              shopData.o48bdaymo[i] = shopData.o48bdaymo[i] - deductedForMonth;
              deductedCount = deductedCount - deductedForMonth;
            } else {
              deductedCount = deductedCount - shopData.o48bdaymo[i];
              shopData.o48bdaymo[i] = 0;
            }
          }

          if (deductedCount <= 0) {
            break;
          }
        }
      } else if (
        contractCounts[0].contract >
          shopData.u48validBday +
            shopData.u48validNoBday +
            shopData.o48validBday &&
        contractCounts[0].contract <=
          shopData.u48validBday +
            shopData.u48validNoBday +
            shopData.o48validBday +
            shopData.o48validNoBday
      ) {
        let deductedCount =
          shopData.u48validBday +
          shopData.u48validNoBday +
          shopData.o48validBday +
          shopData.o48validNoBday -
          contractCounts[0].contract;
        let freq = Array(12).fill(0);
        for (let i = 0; i < 12; i++) {
          freq[i] = shopData.o48tdaymo[i] / shopData.o48validNoBday;
        }
        while (1) {
          for (let i = 0; i < 12; i++) {
            if (deductedCount <= 0) {
              break;
            }

            let deductedForMonth = Math.floor(deductedCount * freq[i]) + 1;
            if (shopData.o48tdaymo[i] > deductedForMonth) {
              shopData.o48tdaymo[i] = shopData.o48tdaymo[i] - deductedForMonth;
              deductedCount = deductedCount - deductedForMonth;
            } else {
              deductedCount = deductedCount - shopData.o48tdaymo[i];
              shopData.o48tdaymo[i] = 0;
            }
          }

          if (deductedCount <= 0) {
            break;
          }
        }
      }

      for (let month = 1; month <= 12; month++) {
        const bdayCustomerForMonth = bdayCustomersForShop.filter(
          (customer) => Number(customer.mbdaymo) === month,
        );
        const tdayCustomerForMonth = tdayCustomersForShop.filter(
          (customer) => Number(customer.tbdaymo) === month,
        );
        limitedCustomers.push(
          bdayCustomerForMonth.slice(
            bdayCustomerForMonth.length -
              (shopData.u48bdaymo[month - 1] + shopData.o48bdaymo[month - 1]),
          ),
        );
        limitedCustomers.push(
          tdayCustomerForMonth.slice(
            tdayCustomerForMonth.length -
              (shopData.u48tdaymo[month - 1] + shopData.o48tdaymo[month - 1]),
          ),
        );
      }
    }

    return limitedCustomers.flat();
  }

  async limitBasedonAnnalCounts(
    stPath: string,
    storePath: string,
    limitPath: string,
  ) {
    const customers = await this.mailinglistCountsService.assignTBday(
      stPath,
      storePath,
    );

    let date48ago = new Date();
    date48ago.setMonth(date48ago.getMonth() - 48);

    // console.log(
    //   customers.filter(
    //     (c) => c.wsId == "1068" && new Date(c.authdate) >= date48ago,
    //   ).length,
    // );

    // console.log(
    //   customers.filter(
    //     (c) =>
    //       c.wsId == "1068" &&
    //       new Date(c.authdate) >= date48ago &&
    //       c.mbdaymo !== "",
    //   ).length,
    // );

    const annualCounts = (
      await this.mailinglistMaxListService.getDeltaLists(limitPath)
    ).slice(0);

    const newCustomer = customers.flat().sort((a, b) => {
      const wsIDDiff = Number(a.wsId) - Number(b.wsId);

      if (wsIDDiff !== 0) {
        return wsIDDiff;
      } else {
        const mbdaymoDiff = Number(b.mbdaymo) - Number(a.mbdaymo);

        if (mbdaymoDiff !== 0) {
          return mbdaymoDiff;
        } else {
          const dateDiff =
            new Date(a.authdate).getTime() - new Date(b.authdate).getTime();
          return dateDiff;
        }
      }

      // if (wsIDDiff !== 0) {
      //   return wsIDDiff;
      // } else {
      //   const dateDiff =
      //     new Date(a.authdate).getTime() - new Date(b.authdate).getTime();

      //   if (dateDiff !== 0) {
      //     return dateDiff;
      //   } else {
      //     const mbdaymoDiff = Number(b.mbdaymo) - Number(a.mbdaymo);
      //     return mbdaymoDiff;
      //   }
      // }
    });

    const counts: CountMap = {};

    for (const item of newCustomer) {
      if (item.wsId === `1024`) {
        item.shopname = "Aero Auto Repair Vista";
      }

      if (!counts[item.wsId]) {
        counts[item.wsId] = {
          wsId: item.wsId,
          software: item.software,
          shopname: item.shopname,
          totalBdaymo: 0,
          bdaymo: Array(12).fill(0),
          totalTdaymo: 0,
          tdaymo: Array(12).fill(0),
          u48validBday: 0,
          u48validNoBday: 0,
          o48validBday: 0,
          o48validNoBday: 0,
        };
      }

      // if (const num = parseFloat(bday))

      if (Number(item.mbdaymo) !== 0) {
        counts[item.wsId].totalBdaymo++;
        counts[item.wsId].bdaymo[parseInt(item.mbdaymo) - 1]++;
      }

      if (Number(item.tbdaymo) !== 0) {
        counts[item.wsId].totalTdaymo++;
        counts[item.wsId].tdaymo[parseInt(item.tbdaymo) - 1]++;
      }
    }

    let limitedCustomers: any[] = [];

    for (const wsId in counts) {
      let shopData = counts[wsId];
      const contractCounts = annualCounts.filter(
        (item) => item.shopId === wsId,
      );
      const bdayCustomersForShop = newCustomer.filter(
        (customer) => customer.wsId === wsId && Number(customer.mbdaymo) !== 0,
      );
      const tdayCustomersForShop = newCustomer.filter(
        (customer) => customer.wsId === wsId && Number(customer.tbdaymo) !== 0,
      );

      if (contractCounts[0].contract === 0) {
        contractCounts[0].deltaValue = 0;
      } else {
        contractCounts[0].deltaValue =
          shopData.totalBdaymo +
          shopData.totalTdaymo -
          contractCounts[0].contract;
      }

      if (contractCounts[0].deltaValue <= 0) {
        limitedCustomers.push(bdayCustomersForShop);
        limitedCustomers.push(tdayCustomersForShop);

        continue;
      }

      if (contractCounts[0].deltaValue > shopData.totalTdaymo) {
        let deductedCount = contractCounts[0].deltaValue - shopData.totalTdaymo;

        while (1) {
          let deductedForMonth =
            deductedCount >= 12
              ? Math.floor(deductedCount / 12)
              : Math.floor(deductedCount / 12) + 1;
          shopData.tdaymo.fill(0);

          for (let i = 0; i < 12; i++) {
            if (deductedCount <= 0) {
              break;
            }

            if (shopData.bdaymo[i] > deductedForMonth) {
              shopData.bdaymo[i] = shopData.bdaymo[i] - deductedForMonth;
              deductedCount = deductedCount - deductedForMonth;
            } else {
              deductedCount = deductedCount - shopData.bdaymo[i];
              shopData.bdaymo[i] = 0;
            }
          }

          if (deductedCount <= 0) {
            break;
          }
        }
      } else {
        let deductedCount = contractCounts[0].deltaValue;

        while (1) {
          let deductedForMonth =
            deductedCount >= 12 || deductedCount === 0
              ? Math.floor(deductedCount / 12)
              : Math.floor(deductedCount / 12) + 1;

          for (let i = 0; i < 12; i++) {
            if (deductedCount <= 0) {
              break;
            }

            if (shopData.tdaymo[i] > deductedForMonth) {
              shopData.tdaymo[i] = shopData.tdaymo[i] - deductedForMonth;
              deductedCount = deductedCount - deductedForMonth;
            } else {
              deductedCount = deductedCount - shopData.tdaymo[i];
              shopData.tdaymo[i] = 0;
            }
          }

          if (deductedCount <= 0) {
            break;
          }
        }
      }

      for (let month = 1; month <= 12; month++) {
        const bdayCustomerForMonth = bdayCustomersForShop.filter(
          (customer) => Number(customer.mbdaymo) === month,
        );
        const tdayCustomerForMonth = tdayCustomersForShop.filter(
          (customer) => Number(customer.tbdaymo) === month,
        );
        limitedCustomers.push(
          bdayCustomerForMonth.slice(
            bdayCustomerForMonth.length - shopData.bdaymo[month - 1],
          ),
        );
        limitedCustomers.push(
          tdayCustomerForMonth.slice(
            tdayCustomerForMonth.length - shopData.tdaymo[month - 1],
          ),
        );
      }
    }

    return limitedCustomers.flat();
  }

  //   async limitBasedMaxCount(
  //     stPath: string,
  //     storePath: string,
  //     limitPath: string,
  //   ) {
  //     const customers = await this.mailinglistCountsService.assignTBday(
  //       stPath,
  //       storePath,
  //     );
  //     const maxLists = (
  //       await this.mailinglistMaxListService.getMaxLists(limitPath)
  //     ).slice(1);

  //     const newCustomers = customers
  //       .filter(
  //         (customer) =>
  //           Number(customer.mbdaymo) === 11 ||
  //           Number(customer.mbdaymo) === 5 ||
  //           Number(customer.tbdaymo) === 5 ||
  //           Number(customer.tbdaymo) === 11,
  //       )
  //       .sort((a, b) => {
  //         const wsIDDiff = Number(a.wsId) - Number(b.wsId);

  //         if (wsIDDiff !== 0) {
  //           return wsIDDiff;
  //         } else {
  //           const mbdaymoDiff = Number(b.mbdaymo) - Number(a.mbdaymo);

  //           if (mbdaymoDiff !== 0) {
  //             return mbdaymoDiff;
  //           } else {
  //             const dateDiff =
  //               new Date(b.authdate).getTime() - new Date(a.authdate).getTime();
  //             return dateDiff;
  //           }
  //         }
  //       });

  //     const newResult = newCustomers.reduce((result, customer) => {
  //       if (!result[customer.wsId]) {
  //         result = {
  //           ...result,
  //           [customer.wsId]: [],
  //         };
  //       }
  //       const limit = Number(
  //         maxLists.find((shop) => {
  //           return shop.shopid === customer.wsId;
  //         })?.values ?? 999999,
  //       );

  //       if (limit > result[customer.wsId].length) {
  //         result = {
  //           ...result,
  //           [customer.wsId]: [...result[customer.wsId], customer],
  //         };
  //       }
  //       return result;
  //     }, {} as Record<string, any>);

  //     return newResult;
  //   }

  //   async limitBasedDeltaCount(
  //     stPath: string,
  //     storePath: string,
  //     limitPath: string,
  //     isAllMos: boolean,
  //     mo: number,
  //   ) {
  //     const customers = await this.mailinglistCountsService.assignTBday(
  //       stPath,
  //       storePath,
  //     );
  //     const deltaValuses = await this.mailinglistMaxListService.getDeltaLists(
  //       limitPath,
  //     );

  //     let newCustomers = [];

  //     if (isAllMos) {
  //       newCustomers = customers.sort((a, b) => {
  //         const wsIDDiff = Number(a.wsId) - Number(b.wsId);

  //         if (wsIDDiff !== 0) {
  //           return wsIDDiff;
  //         } else {
  //           const mbdaymoDiff = Number(b.mbdaymo) - Number(a.mbdaymo);

  //           if (mbdaymoDiff !== 0) {
  //             return mbdaymoDiff;
  //           } else {
  //             const dateDiff =
  //               new Date(b.authdate).getTime() - new Date(a.authdate).getTime();
  //             return dateDiff;
  //           }
  //         }
  //       });
  //     } else {
  //       newCustomers = customers
  //         .filter(
  //           (customer) =>
  //             Number(customer.mbdaymo) === mo ||
  //             Number(customer.mbdaymo) === mo - 6 ||
  //             Number(customer.tbdaymo) === mo - 6 ||
  //             Number(customer.tbdaymo) === mo,
  //         )
  //         .sort((a, b) => {
  //           const wsIDDiff = Number(a.wsId) - Number(b.wsId);

  //           if (wsIDDiff !== 0) {
  //             return wsIDDiff;
  //           } else {
  //             const mbdaymoDiff = Number(b.mbdaymo) - Number(a.mbdaymo);

  //             if (mbdaymoDiff !== 0) {
  //               return mbdaymoDiff;
  //             } else {
  //               const dateDiff =
  //                 new Date(b.authdate).getTime() - new Date(a.authdate).getTime();
  //               return dateDiff;
  //             }
  //           }
  //         });
  //     }

  //     let limitedCustomers = [];

  //     for (const delta of deltaValuses) {
  //       const filteredCustomers = newCustomers.filter(
  //         (c) => c.shopname === delta.shopName,
  //       );
  //       if (delta.deltaValue >= 0) {
  //         limitedCustomers.push(...filteredCustomers.slice(delta.deltaValue));
  //       } else {
  //         limitedCustomers.push(...filteredCustomers);
  //       }
  //     }

  //     return limitedCustomers;
  //   }

  async generateMailingLists(
    stPath: string,
    storePath: string,
    limitPath: string,
    mo: number,
  ) {
    const customers = await this.limitBasedonAnnaulCountsFocusAuthdate(
      stPath,
      storePath,
      limitPath,
    );

    const newCustomers = customers
      .filter(
        (customer) =>
          Number(customer.mbdaymo) === mo ||
          Number(customer.mbdaymo) === mo - (mo < 7 ? -6 : 6) ||
          Number(customer.tbdaymo) === mo - (mo < 7 ? -6 : 6) ||
          Number(customer.tbdaymo) === mo,
      )
      .sort((a, b) => {
        const wsIDDiff = Number(a.wsId) - Number(b.wsId);

        if (wsIDDiff !== 0) {
          return wsIDDiff;
        } else {
          const mbdaymoDiff = Number(b.mbdaymo) - Number(a.mbdaymo);

          if (mbdaymoDiff !== 0) {
            return mbdaymoDiff;
          } else {
            const dateDiff =
              new Date(b.authdate).getTime() - new Date(a.authdate).getTime();
            return dateDiff;
          }
        }
      });

    const combinedArray = ([] as any[]).concat(...Object.values(newCustomers));

    const updatedCustomers = combinedArray.map((customer) => {
      if (Number(customer.mbdaymo) === mo - (mo < 7 ? -6 : 6)) {
        return {
          ...customer,
          ListName: `HDayList ${mo}`,
        };
      } else if (Number(customer.mbdaymo) === mo) {
        return {
          ...customer,
          ListName: `BDayList ${mo}`,
        };
      } else if (
        Number(customer.tbdaymo) === mo ||
        Number(customer.tbdaymo) === mo - (mo < 7 ? -6 : 6)
      ) {
        return {
          ...customer,
          ListName: `THDayList ${mo}`,
        };
      } else {
        return {
          ...customer,
          ListName: "",
        };
      }
    });

    return updatedCustomers;
  }

  async generateMailingListsPerShop(
    stPath: string,
    storePath: string,
    limitPath: string,
    mo: number,
  ) {
    const customers = await this.generateMailingLists(
      stPath,
      storePath,
      limitPath,
      mo,
    );

    const wsidListname = new Map<string, any[]>();
    const keys = new Map<string, number>();
    customers.forEach((customer) => {
      const { wsId, ListName, shopname } = customer;

      if (ListName != "") {
        const key = `${wsId}-${ListName}-${shopname}`;
        keys.set(key, (keys.get(key) || 0) + 1);
        if (!wsidListname.has(key)) {
          wsidListname.set(key, []);
        }
        wsidListname.get(key)?.push(customer);
      }
    });

    return Array.from(wsidListname.values());
  }
}
