import type { HotelData, MapboxAdapterOptions } from "./types";
import { generateHotelDetailsPath } from "./utils";

export function renderPopup(
  hotel: HotelData,
  deepLinkConfig: MapboxAdapterOptions["deepLinkConfig"]
): HTMLDivElement {
  const deepLink = generateHotelDetailsPath({
    hotelId: hotel.id,
    ...deepLinkConfig,
  });

  const container = document.createElement("div");
  const content = document.createElement("div");
  content.className = "popup";

  const anchor = document.createElement("a");
  anchor.className = "popup__link";
  anchor.href = deepLink;
  anchor.target = "_blank";
  anchor.innerText = `${hotel.price} ${hotel.currency}`;

  content.appendChild(anchor);
  container.appendChild(content);

  return container;
}
