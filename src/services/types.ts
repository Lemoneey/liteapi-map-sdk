import type { HotelData, ViewConfig } from "../adapters/types";

export interface ApiClient {
  getPlaceData(): Promise<ViewConfig>;
  getRates(): Promise<HotelData[]>;
}
