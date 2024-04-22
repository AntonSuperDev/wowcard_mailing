import { Inject, Injectable, Logger } from "@nestjs/common";
import { Pool } from "pg";

type ProCustomerObject = {
  Header: {
    ID: string;
    CreationTime: Date | null;
    DeletionTime: Date | null;
    LastModifiedTime: Date | null;
    LastModifiedBy: string | null;
  };
  ID: string;
  FileAs: string | null;
  Name: {
    Title: string | null;
    Prefix: string | null;
    FirstName: string | null;
    MiddleName: string | null;
    LastName: string | null;
    Suffix: string | null;
  };
  Address: {
    Title: string | null;
    Street: string | null;
    City: string | null;
    Province: string | null;
    PostalCode: string | null;
    Country: string | null;
  };
  Company: string | null;
  Phone1Title: string | null;
  Phone1: string | null;
  Phone2Title: string | null;
  Phone2: string | null;
  EmailTitle: string | null;
  Email: string | null;
  AdditionalURIs: {
    Item: any[] | null;
  };
  AdditionalPhones: {
    Item: any[] | null;
  };
  MarketingSource: string | null;
  Note: string | null;
  NoMessaging: boolean | null;
  NoEmail: boolean | null;
  NoPostCard: boolean | null;
};

@Injectable()
export class ProCustomerService {
  constructor(@Inject("DB_CONNECTION") private readonly db: Pool) {}

  async wrtieToDB(proCustomers: ProCustomerObject [], shopName: string) {
    const customers = proCustomers.reduce(
        (result, contact) => ({
          ids: [...result.ids, contact.ID],
          creationTimes: [...result.creationTimes, contact.Header.CreationTime],
          deletionTimes: [...result.deletionTimes, contact.Header.DeletionTime],
          lastModifiedTimes: [
            ...result.lastModifiedTimes,
            contact.Header.LastModifiedTime,
          ],
          fileAses: [...result.fileAses, contact.FileAs],
          nameTitles: [...result.nameTitles, contact.Name.Title],
          namePrefixes: [...result.namePrefixes, contact.Name.Prefix],
          firstNames: [...result.firstNames, contact.Name.FirstName],
          middleNames: [...result.middleNames, contact.Name.MiddleName],
          lastNames: [...result.lastNames, contact.Name.LastName],
          shopnames: [...result.shopnames, shopName],
          suffixes: [...result.suffixes, contact.Name.Suffix],
          addresstitles: [...result.addresstitles, contact.Address.Title],
          addressstreets: [...result.addressstreets, contact.Address.Street],
          addresscities: [...result.addresscities, contact.Address.City],
          addressprovinces: [
            ...result.addressprovinces,
            contact.Address.Province,
          ],
          addresspostalcodes: [
            ...result.addresspostalcodes,
            contact.Address.PostalCode,
          ],
          addresscountries: [...result.addresscountries, contact.Address.Country],
          companies: [...result.companies, contact.Company],
          phone1Titles: [...result.phone1Titles, contact.Phone1Title],
          phone1s: [...result.phone1s, contact.Phone1],
          phone2Titles: [...result.phone2Titles, contact.Phone2Title],
          phone2s: [...result.phone2s, contact.Phone2],
          emailTitles: [...result.emailTitles, contact.EmailTitle],
          emails: [...result.emails, contact.Email],
          marketingSources: [...result.marketingSources, contact.MarketingSource],
          notes: [...result.notes, contact.Note],
          noMessaginges: [...result.noMessaginges, contact.NoMessaging],
          noEmails: [...result.noEmails, contact.NoEmail],
          noPostCards: [...result.noPostCards, contact.NoPostCard],
        }),
        {
          ids: [] as string[],
          creationTimes: [] as (Date | null)[],
          deletionTimes: [] as (Date | null)[],
          lastModifiedTimes: [] as (Date | null)[],
          fileAses: [] as (string | null)[],
          nameTitles: [] as (string | null)[],
          namePrefixes: [] as (string | null)[],
          firstNames: [] as (string | null)[],
          middleNames: [] as (string | null)[],
          lastNames: [] as (string | null)[],
          shopnames: [] as (string | null)[],
          suffixes: [] as (string | null)[],
          addresstitles: [] as (string | null)[],
          addressstreets: [] as (string | null)[],
          addresscities: [] as (string | null)[],
          addressprovinces: [] as (string | null)[],
          addresspostalcodes: [] as (string | null)[],
          addresscountries: [] as (string | null)[],
          companies: [] as (string | null)[],
          phone1Titles: [] as (string | null)[],
          phone1s: [] as (string | null)[],
          phone2Titles: [] as (string | null)[],
          phone2s: [] as (string | null)[],
          emailTitles: [] as (string | null)[],
          emails: [] as (string | null)[],
          marketingSources: [] as (string | null)[],
          notes: [] as (string | null)[],
          noMessaginges: [] as (boolean | null)[],
          noEmails: [] as (boolean | null)[],
          noPostCards: [] as (boolean | null)[],
        },
      );
      await this.db.query(
        `
              INSERT INTO protractorcontact (
                id,
                creationtime,
                deletiontime,
                lastmodifiedtime,
                fileas,
                nametitle,
                nameprefix,
                firstname,
                middlename,
                lastname,
                shopname,
                suffix,
                addresstitle,
                addressstreet,
                addresscity,
                addressprovince,
                addresspostalcode,
                addresscountry,
                company,
                phone1title,
                phone1,
                phone2title,
                phone2,
                emailtitle,
                email,
                marketingsource,
                note,
                nomessaging,
                noemail,
                nopostcard
              )
              SELECT * FROM UNNEST (
                $1::varchar(150)[],
                $2::date[],
                $3::date[],
                $4::date[],
                $5::varchar(100)[],
                $6::varchar(50)[],
                $7::varchar(50)[],
                $8::varchar(50)[],
                $9::varchar(50)[],
                $10::varchar(50)[],
                $11::varchar(50)[],
                $12::varchar(50)[],
                $13::varchar(50)[],
                $14::varchar(50)[],
                $15::varchar(50)[],
                $16::varchar(50)[],
                $17::varchar(50)[],
                $18::varchar(50)[],
                $19::varchar(50)[],
                $20::varchar(50)[],
                $21::varchar(50)[],
                $22::varchar(50)[],
                $23::varchar(50)[],
                $24::varchar(50)[],
                $25::varchar(50)[],
                $26::varchar(150)[],
                $27::varchar(150)[],
                $28::boolean[],
                $29::boolean[],
                $30::boolean[]
              )
              ON CONFLICT (id)
              DO UPDATE
              SET
              id = EXCLUDED.id,
              creationtime = EXCLUDED.creationtime,
              deletiontime = EXCLUDED.deletiontime,
              lastmodifiedtime = EXCLUDED.lastmodifiedtime,
              fileas = EXCLUDED.fileas,
              nametitle = EXCLUDED.nametitle,
              nameprefix = EXCLUDED.nameprefix,
              firstname = EXCLUDED.firstname,
              middlename = EXCLUDED.middlename,
              lastname = EXCLUDED.lastname,
              shopname = EXCLUDED.shopname,
              suffix = EXCLUDED.suffix,
              addresstitle = EXCLUDED.addresstitle,
              addressstreet = EXCLUDED.addressstreet,
              addresscity = EXCLUDED.addresscity,
              addressprovince = EXCLUDED.addressprovince,
              addresspostalcode = EXCLUDED.addresspostalcode,
              company = EXCLUDED.company,
              phone1title = EXCLUDED.phone1title,
              phone1 = EXCLUDED.phone1,
              phone2title = EXCLUDED.phone2title,
              phone2 = EXCLUDED.phone2,
              emailtitle = EXCLUDED.emailtitle,
              email = EXCLUDED.email,
              marketingsource = EXCLUDED.marketingsource,
              note = EXCLUDED.note,
              nomessaging = EXCLUDED.nomessaging,
              noemail = EXCLUDED.noemail,
              nopostcard = EXCLUDED.nopostcard`,
        [
          customers.ids,
          customers.creationTimes,
          customers.deletionTimes,
          customers.lastModifiedTimes,
          customers.fileAses,
          customers.nameTitles,
          customers.namePrefixes,
          customers.firstNames,
          customers.middleNames,
          customers.lastNames,
          customers.shopnames,
          customers.suffixes,
          customers.addresstitles,
          customers.addressstreets,
          customers.addresscities,
          customers.addressprovinces,
          customers.addresspostalcodes,
          customers.addresscountries,
          customers.companies,
          customers.phone1Titles,
          customers.phone1s,
          customers.phone2Titles,
          customers.phone2s,
          customers.emailTitles,
          customers.emails,
          customers.marketingSources,
          customers.notes,
          customers.noMessaginges,
          customers.noEmails,
          customers.noPostCards,
        ],
      );
  }
}