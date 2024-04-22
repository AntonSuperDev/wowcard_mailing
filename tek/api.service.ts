import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import fetch, { RequestInit, Response } from "node-fetch";
import { URLSearchParams } from "url";
import Limiter from "bottleneck";
import HttpsProxyAgent from "https-proxy-agent";

export type TekmetricAuthResponse = {
  access_token: string;
  token_type: "bearer";
  scope: string;
};

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

type TokenResult = {
  accessToken: string;
  tokenType: string;
  createdAt: Date;
  scope: string;
};

function createErrorMessage(path: string, body: unknown, method?: string) {
  return `Tekmetric API request failed: ${method || "GET"} ${path}
${JSON.stringify(body, null, 2)}`;
}

@Injectable()
export class TekmetricApiService {
  apiToken: TokenResult | null = null;

  constructor(
    private configService: ConfigService,
    @Inject("Bottleneck") private limiter: Limiter,
  ) {
    this.fetch = this.fetch.bind(this);
  }

  async authenticate() {
    const body = new URLSearchParams({
      grant_type: "client_credentials",
    });

    const credentials = Buffer.from(
      `${this.configService.get(
        "TEKMETRIC_CLIENT_ID",
      )}:${this.configService.get("TEKMETRIC_CLIENT_SECRET")}`,
    ).toString("base64");

    const res = await fetch(
      `${this.configService.get("TEKMETRIC_API_ROOT")}/oauth/token`,
      {
        method: "POST",
        body,
        headers: {
          Authorization: `Basic ${credentials}`,
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        agent: HttpsProxyAgent(
          "http://14aeca914cde8:ab9f99d565@122.8.116.244:12323",
        ),
      },
    );

    const tokenResponse: TekmetricAuthResponse = await res.json();
    const createdAt = new Date();

    this.apiToken = {
      accessToken: tokenResponse.access_token,
      tokenType: tokenResponse.token_type,
      createdAt,
      scope: tokenResponse.scope,
    };

  }

  async fetch<TResult>(path: string, options?: RequestInit): Promise<TResult> {
    try {
      if (this.apiToken === null) {
        await this.authenticate();
      }

      const res = this.limiter.schedule(() =>
        fetch(
          `${this.configService.get<string>("TEKMETRIC_API_ROOT")}${path}`,
          {
            headers: {
              Authorization: `Bearer ${this.configService.get<string>(
                "TEKMETRIC_API_KEY",
                this.apiToken?.accessToken ?? "",
              )}`,
              Accept: "application/json",
              "Content-Type": "application/json",
              ...options?.headers,
            },
            agent: HttpsProxyAgent(
              "http://14aeca914cde8:ab9f99d565@122.8.116.244:12323",
            ),
            ...options,
          },
        ),
      );

      if (
        !((await res).headers.get("content-type") ?? "")?.startsWith(
          "application/json",
        )
      ) {
        if ((await res).ok) {
          return undefined as TResult;
        } else {
          throw new Error((await res).statusText);
        }
      } else if ((await res).status === 401) {
        // If the last request returned "unauthorized", re-authenticate and retry
        await this.authenticate();
        return await this.fetch(path, options);
      } else {
        const body: TResult = await (await res).json();

        if ((await res).ok) {
          return body;
        } else {
          throw new Error(JSON.stringify(body, null, 2));
        }
      }
    } catch (ex) {
      let message = "";
      if (ex instanceof Response) {
        // `json` will be a function on the error if the promise was rejected
        message = (await ex.json()).message;
      } else if (ex instanceof Error) {
        message = ex.message;
      }

      throw new Error(createErrorMessage(path, message, options?.method));
    }
  }
}
