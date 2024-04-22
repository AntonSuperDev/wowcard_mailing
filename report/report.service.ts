import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { google, sheets_v4 } from "googleapis";
import { JWT } from "google-auth-library";

@Injectable()
export class ReportService {
  private sheets: sheets_v4.Sheets;

  constructor(private configService: ConfigService) {
    const client = new JWT({
      email: `wowcardservice@caramel-dialect-402313.iam.gserviceaccount.com`,
      key: `-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCND2EUGnhH+nbK\nof50jSSsXW/MVnO6AradvPIFYpRjufxlaPvX9he4ChQFsS/DoGIHXTesHn5v5tq+\nG/zhLLtV3yG0SHXUkzyVEoeV4O5TjBtqg631+hJv/TxlQXbcOYYC6eu1RZZbULQA\nVzTjOqBTK57XF9uAmWionG6DacxtznUMX120Dr1uywKw6F2cTDggsYsjAEM3681J\n4ifP4i9w+8n0azlQN8oGc2+5pmCOJ48XCmnkKbM64t0syW9464OVF3mizOFI/H5K\nNKrb4eTEoA2CQzuDoctbn+JnUltzPLMQd03eoej/Vv7A52UvNrP6BFWpFxKPKf4R\n0yUfHkf5AgMBAAECggEAAQFYdixZ77m+icv2YX37drJz80i0zWzIKWHjSJBEsaKE\n/tCP8c8w188lH3lxjo+SFi6Hv1s4dVwmOBsR9IJ9PDGn7ptLOdt1fO5MGhB4+w5x\nU8HFHXeZQ2b1X4uKBiw1IvbQzMzdvtplJ3QDSFa6TPNA26ul5n43NCHdQtjC8cnr\nwNCR3ikRUm7+XLF4T9btsDNEzSdTE6M3quyq/oR68NuNUZnVpQqdLUabKosWq6Na\nuvZMZyGVAphw9+xj5Ui3vgV3ZuGlTbno3zbubVeUoXSqVuS/vJnJu9MNrwJ5pEG/\niE3cbQhZ3rKJJyehLWHTnSDrYuFxKDIXXI6yOkeNiwKBgQDAnhPDnnE20zylm2lh\npi4B63FI9XKhobmG/nhqT/pSsJmntHuqofnhXy/1xx0C0zeig6BNOdAdoSIVqucP\nN3kJwGoMfkK6Y4L6V/vT0BYmXD+osA620ihik4biz65oGQ/rrn0TQ+liQL7jg+NH\n5P0rbiRcIkjXT7MiZnMXtF42TwKBgQC7eibzptRZHMpyFZzt1uR+Y/cIawYeIcHw\nzwdSQ6A0hATBhXBbZivAM8cVW+lLsTTvhEaCCFylbIJoSEJMNA46o+eFHpV2JV0u\n6yEkoWfAIcFM3tz+7uAy9CoCxZIz+o/0rJS/zr2c0UHbxoQFBDY/MlzQmfWmp7JM\nZwCMDCtTNwKBgBIp1etIcZyd5sYnFZTjusrrjM84dgrP2VLlhC1iRVSu2o558n9w\nrsOV2kvu7slpaYGlr+QYY4unujMY3pkMvhkxT87FyT0STTOWQGUE5lHPuSELGRgc\nUTqadsnEk8m1M08iMSEz8joVqOqDcVdCPK1vwXX+tae4GEhSKOA/XfL5AoGAZd33\nsEij9U+5iMfJn0o2mZ6DqiVNC65YDRrQ5ZgtQpvBYc25wVAA0czQjgCFAUXmd4au\nMRWOEaymJzesHm/ik2Zf9Gsr1yhyO34zYg35q+IrgDNQbY0qcUVOVnc3+9pXwiDM\nKnSRftYNLPfu4DLrrucUm5wsaEOSlAUbvP0XxX0CgYAULS2VpFdFdcHCoSs3iGBJ\nvWISQMC6PiW3DZvtaP+vJiTDYbs7/7kLrkFaT2H790niorUU3m1IOlmDdmcFoQYE\n+N9PV5xZFlqrFD/67JR5xDuzj0mkhBsbBceeFHX/uZGB8xg0W0OnRa/oXODg8fVs\nj6IWvJbPKi/dtTXnzqhwSg==\n-----END PRIVATE KEY-----\n`,
      scopes: [`https://www.googleapis.com/auth/spreadsheets`],
    });

    this.sheets = google.sheets({ version: "v4", auth: client });
  }

  async updateSheet(
    sheetId: string,
    range: string,
    values: any[][],
  ): Promise<void> {
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values,
      },
    });
  }

  async getSheetData(sheetId: string, sheetName: string): Promise<any[][]> {
    // Separate ranges for each column
    const ranges = [`${sheetName}!E:E`, `${sheetName}!AG:AG`];

    try {
      const response = await this.sheets.spreadsheets.values.batchGet({
        spreadsheetId: sheetId,
        ranges: ranges,
      });

      // Assuming we want to combine the data from both columns row-wise
      const dataD = response.data.valueRanges?.[0].values ?? [];
      const dataI = response.data.valueRanges?.[1].values ?? [];
      let combinedData = [];

      // Combine data from both columns, row by row
      for (let i = 0; i < Math.max(dataD.length, dataI.length); i++) {
        combinedData.push([
          dataD[i] ? dataD[i][0] : null, // Data from column C or null if unavailable
          dataI[i] ? dataI[i][0] : null, // Data from column W or null if unavailable
        ]);
      }

      return combinedData;
    } catch (error) {
      console.error("The API returned an error: " + error);
      return [];
    }
  }

  getRangeForData(data: any[][]) {
    const rowCount = data.length + 3;
    const colCount = data[0].length;

    const colLetter = this.numberToColumnLetter(colCount);

    // return `MailingList!A4:${colLetter}${rowCount}`;
    return `Sheet1!A4:${colLetter}${rowCount}`;
  }

  numberToColumnLetter(col: number): string {
    let columnLetter = "";

    while (col > 0) {
      const temp = (col - 1) % 26;
      columnLetter = String.fromCharCode(temp + 65) + columnLetter;
      col = (col - temp - 1) / 26;
    }
    return columnLetter;
  }
}
