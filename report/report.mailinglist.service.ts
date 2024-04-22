import { Injectable, Inject } from "@nestjs/common";
import { ReportService } from "./report.service";
import { MailinglistCountsService } from "../mailinglist/mailinglist.counts.service";
import { MailinglistGenerateService } from "../mailinglist/mailinglist.generate.service";
import { Pool } from "pg";

interface CountDetails {
  wsId: string;
  software: string;
  shopname: string;
  o60valid: number;
  u48valid: number;
  u60valid: number;
  totalCounts: number;
  totalBdaymo: number;
  bdaymo: number[];
  totalTdaymo: number;
  tdaymo: number[];
}

type CountMap = {
  [shopname: string]: CountDetails;
};

@Injectable()
export class ReportMailingListService {
  constructor(
    private readonly reportService: ReportService,
    private readonly mailingListCountsService: MailinglistCountsService,
    private readonly mailingListGenerateService: MailinglistGenerateService,
    @Inject("DB_CONNECTION") private readonly db: Pool,
  ) {}

  async calculateCountsPerShop(
    stPath: string,
    storePath: string,
    limitPath: string,
  ): Promise<CountMap> {
    const customers =
      await this.mailingListGenerateService.limitBasedonAnnaulCountsFocusAuthdate(
        stPath,
        storePath,
        limitPath,
      );

    const counts: CountMap = {};
    let date48ago = new Date();
    date48ago.setMonth(date48ago.getMonth() - 48);
    let date60ago = new Date();
    date60ago.setMonth(date60ago.getMonth() - 60);

    for (const item of customers) {
      if (item.wsId === `1024`) {
        item.shopname = "Aero Auto Repair Vista";
      }

      if (!counts[item.shopname]) {
        counts[item.shopname] = {
          wsId: item.wsId,
          software: item.software,
          shopname: item.shopname,
          o60valid: 0,
          u60valid: 0,
          u48valid: 0,
          totalCounts: 0,
          totalBdaymo: 0,
          bdaymo: Array(12).fill(0),
          totalTdaymo: 0,
          tdaymo: Array(12).fill(0),
        };
      }

      if (new Date(item.authdate) >= date48ago) {
        counts[item.shopname].u48valid++;
      } else if (new Date(item.authdate) >= date60ago) {
        counts[item.shopname].u60valid++;
      } else {
        counts[item.shopname].o60valid++;
      }

      if (Number(item.mbdaymo) !== 0) {
        counts[item.shopname].totalBdaymo++;
        counts[item.shopname].bdaymo[parseInt(item.mbdaymo) - 1]++;
      }

      if (Number(item.tbdaymo) !== 0) {
        counts[item.shopname].totalTdaymo++;
        counts[item.shopname].tdaymo[parseInt(item.tbdaymo) - 1]++;
      }
    }

    return counts;
  }

  async appendCountsPerShop(counts: CountMap): Promise<void> {
    const data = [];

    for (let shopname in counts) {
      const row = [];
      const shopData = counts[shopname];

      const u48ValidNoBdays = await this.db.query(
        `
        SELECT 
          id
        FROM accuzipcustomer 
        WHERE (mbdaymo ='' OR mbdaymo = '0')
        AND wsid = '${shopData.wsId}'
        AND Date(authdate) >= NOW() - INTERVAL '48 MONTHS'
        AND status_ = 'V'`,
      );

      row.push(
        shopData.wsId,
        shopData.software,
        shopData.shopname,
        undefined,
        undefined,
        u48ValidNoBdays.rows.length,
        shopData.o60valid,
        shopData.u60valid,
        shopData.u48valid,
        undefined,
        shopData.totalBdaymo + shopData.totalTdaymo,
        shopData.totalBdaymo,
        ...shopData.bdaymo,
        shopData.totalTdaymo,
        ...shopData.tdaymo,
      );
      data.push(row);
    }

    const spreadSheetId = "1JOz-1KterCPSONW2JzFxyiGuacpNA6VlSxNa5VJLBl8";
    const range = this.reportService.getRangeForData(data);

    await this.reportService.updateSheet(spreadSheetId, range, data);
  }
}
