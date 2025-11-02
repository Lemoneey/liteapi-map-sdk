import type { HotelData, ViewConfig } from "../../adapters/types";
import { ApiClient } from "../types";
import { normalizePlaceData, normalizeRateData } from "./normalizers";
import type { ApiConfig } from "./types";
import { mergeHotels } from "./utils";

export class LiteApiClient implements ApiClient {
  private proxyDomain: string;
  private config: Partial<ApiConfig> = {};

  constructor(proxyDomain: string, config: ApiConfig) {
    this.proxyDomain = proxyDomain;
    this.config = { ...config };
  }

  private async callProxy(
    path: string,
    options: RequestInit = {}
  ): Promise<unknown> {
    const url = `https://${this.proxyDomain}${path}`;

    options.headers = {
      ...options.headers,
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    try {
      const response = await fetch(url, options);
      const body = await response.json();

      if (!response.ok) {
        throw new Error(
          `API call failed with status ${response.status}: ${body.message}`
        );
      }

      return body as unknown;
    } catch (error) {
      throw new Error(`Failed to reach proxy server at ${url}.`);
    }
  }

  public async getPlaceData(): Promise<ViewConfig> {
    const path = `/places/${this.config.placeId}`;
    const data = await this.callProxy(path, {
      method: "GET",
    });

    return normalizePlaceData(data);
  }

  public async getRates(): Promise<HotelData[]> {
    const { placeId, checkin, checkout } = this.config;
    const payload = {
      placeId,
      occupancies: [{ adults: 2 }],
      checkin,
      checkout,
      currency: "USD",
      guestNationality: "US",
    };

    const path = `/hotels/rates`;
    const data = await this.callProxy(path, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const normalizedData = normalizeRateData(data);

    return mergeHotels(normalizedData);
  }
}
