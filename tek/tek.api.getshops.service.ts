import { Inject, Injectable, Logger } from "@nestjs/common";
import { Pool } from "pg";
import { TekmetricApiService } from "./api.service";

export type TekmetricShop = {
  id: number;
  environment: string | null;
  name: string | null;
  nickname: string | null;
  phone: string;
  email: string | null;
  website: string | null;
  timeZoneId: string | null;
  address: {
    id: number;
    address1: string | null;
    address2: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    fullAddress: string | null;
    streetAddress: string | null;
  };
  roCustomLabelEnabled: boolean;
};

@Injectable()
export class TekShopService {
  private readonly logger = new Logger(TekShopService.name);
  constructor(
    private readonly tekmetricApiService: TekmetricApiService,
    @Inject("DB_CONNECTION") private readonly db: Pool,
  ) {}

  async fetchAndWriteShops() {
    const result = await this.tekmetricApiService.fetch<TekmetricShop[]>(
      `/shops`,
    );

    console.log(result);

    const shops = result.reduce(
      (result, shop) => ({
        ids: [...result.ids, String(shop.id)],
        names: [...result.names, shop.name],
        phones: [...result.phones, shop.phone],
        emails: [...result.emails, shop.email],
        websites: [...result.websites, shop.website],
        addresses: [...result.addresses, shop.address?.fullAddress]
      }),
      {
        ids: [] as string[],
        names: [] as (string | null)[],
        phones: [] as (string | null)[],
        emails: [] as (string | null)[],
        websites: [] as (string | null)[],
        addresses: [] as (string | null)[]
      },
    );

    console.log(shops)

    await this.db.query(
      `
            INSERT INTO tekshop (
                id,
                name,
                phone,
                email,
                website,
                address
            )
            SELECT * FROM UNNEST (
                $1::varchar(20)[],
                $2::varchar(50)[],
                $3::varchar(50)[],
                $4::varchar(50)[],
                $5::varchar(50)[],
                $6::varchar(50)[]
            )
            ON CONFLICT (id)
            DO UPDATE
            SET
                name = EXCLUDED.name,
                phone = EXCLUDED.phone,
                email = EXCLUDED.email,
                website = EXCLUDED.website,
                address = EXCLUDED.address
            `,
      [shops.ids, shops.names, shops.phones, shops.emails, shops.websites, shops.addresses],
    );
  }
}
