import type { ViewConfig } from "../../adapters/types";
import type { HotelRates } from "./types";

export const fallbackPlaceData: ViewConfig = {
  location: {
    latitude: 51.47669145777159,
    longitude: 0,
  },
  viewport: {
    high: {
      latitude: 51.46669145777159,
      longitude: 0.1,
    },
    low: {
      latitude: 51.48669145777159,
      longitude: -0.1,
    },
  },
};

export const fallbackRate: HotelRates = {
  data: [],
  hotels: [],
};
