import { fallbackPlaceData, fallbackRate } from "./constants";
import type { Hotel, HotelOverview, HotelRates, RoomType } from "./types";
import type { ViewConfig } from "../../adapters/types";
import type { DeepPartial } from "../../types";

export function normalizePlaceData(data: unknown): ViewConfig {
  if (!data || typeof data !== "object") return fallbackPlaceData;

  const { data: rowData } = data as DeepPartial<{ data: ViewConfig }>;

  const rawViewport = rowData?.viewport;
  const rawLocation = rowData?.location;
  // TODO: There is fallback values ti display at least something (need to discuss)
  const { viewport: fbViewport, location: fbLocation } = fallbackPlaceData;

  const viewport: ViewConfig["viewport"] = {
    low: {
      latitude:
        (rawViewport?.low?.latitude as number) || fbViewport.low.latitude,
      longitude:
        (rawViewport?.low?.longitude as number) || fbViewport.low.longitude,
    },
    high: {
      latitude:
        (rawViewport?.high?.latitude as number) || fbViewport.high.latitude,
      longitude:
        (rawViewport?.high?.longitude as number) || fbViewport.high.longitude,
    },
  };

  return {
    location: {
      latitude: (rawLocation?.latitude as number) || fbLocation.latitude,
      longitude: (rawLocation?.longitude as number) || fbLocation.longitude,
    },
    viewport: viewport,
  };
}

export function normalizeRateData(raw: unknown): HotelRates {
  if (!raw || typeof raw !== "object") return fallbackRate;

  const rawData = raw as DeepPartial<HotelRates>;

  const data: Hotel[] = Array.isArray(rawData.data)
    ? rawData.data.map((h) => {
        const hotelId =
          typeof h === "object" &&
          (typeof h?.hotelId === "string" || typeof h?.hotelId === "number")
            ? `${h.hotelId}`
            : "unknown";

        const roomTypes: RoomType[] = Array.isArray(h?.roomTypes)
          ? h.roomTypes.map((r) => ({
              offerRetailRate: {
                amount:
                  typeof r?.offerRetailRate?.amount === "number"
                    ? r.offerRetailRate.amount
                    : 0,
                currency:
                  typeof r?.offerRetailRate?.currency === "string"
                    ? r.offerRetailRate.currency
                    : "USD",
              },
            }))
          : [];

        return { hotelId, roomTypes };
      })
    : [];

  const hotels: HotelOverview[] = Array.isArray(rawData.hotels)
    ? rawData.hotels.map((h) => ({
        id:
          typeof h?.id === "string" || typeof h?.id === "number"
            ? `${h.id}`
            : "unknown",
        name: typeof h?.name === "string" ? h.name : "Unnamed Hotel",
        main_photo: typeof h?.main_photo === "string" ? h.main_photo : "",
        address: typeof h?.address === "string" ? h.address : "",
        rating: typeof h?.rating === "number" ? h.rating : 0,
      }))
    : [];

  return { data, hotels };
}
