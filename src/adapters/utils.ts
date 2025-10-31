import { DOMAIN, OCCUPANCIES } from "./constants";

export function encodeToBase64(obj: Object): string {
  const jsonString = JSON.stringify(obj);

  if (typeof btoa === "function") {
    return btoa(jsonString);
  } else {
    throw new Error(
      "Base64 encoding function not available in this environment."
    );
  }
}

export function generateHotelDetailsPath({
  placeId,
  checkin,
  checkout,
  hotelId,
}: {
  placeId?: string;
  checkin?: string;
  checkout?: string;
  hotelId: string;
}): string {
  const encodedOccupancies = encodeURIComponent(encodeToBase64(OCCUPANCIES));

  const url = new URL(`/hotels/${hotelId}`, DOMAIN);
  url.searchParams.set("placeId", placeId || "");
  url.searchParams.set("checkin", checkin || "");
  url.searchParams.set("checkout", checkout || "");
  url.searchParams.set("occupancies", encodedOccupancies);

  return url.toString();
}
