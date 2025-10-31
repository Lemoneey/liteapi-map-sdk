import type { HotelData } from "../../adapters/types";
import type { HotelRates } from "./types";

export function mergeHotels(hotels: HotelRates): HotelData[] {
  if (!hotels || !Array.isArray(hotels.data) || !Array.isArray(hotels.hotels)) {
    return [];
  }

  const overviewById = new Map(hotels.hotels.map((h) => [h.id, h]));

  const merged: HotelData[] = [];

  for (const hotel of hotels.data) {
    const overview = overviewById.get(hotel.hotelId);
    if (!overview) continue;

    const validRates = hotel.roomTypes
      .map((r) => r.offerRetailRate?.amount)
      .filter((v): v is number => typeof v === "number" && !isNaN(v));

    if (!validRates.length) continue;

    const minPrice = Math.min(...validRates);
    const currency = hotel.roomTypes[0]?.offerRetailRate?.currency ?? "USD";

    merged.push({
      id: overview.id,
      price: minPrice,
      currency,
      name: overview.name,
      latitude: 0, // TODO: fallback since API doesn't return remove it
      longitude: 0, // TODO: fallback since API doesn't return remove it
    });
  }

  return merged;
}
