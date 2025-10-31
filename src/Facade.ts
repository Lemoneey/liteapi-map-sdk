import type { InitConfig } from "./types";
import { MapboxAdapter } from "./adapters/Mapbox";
import { MapManager } from "./MapManager";
import { LiteApiClient } from "./services/LiteApi";
import { getCheckinCheckoutDates } from "./utils";

import "./styles/index.css";

export const LiteAPI = {
  Map: {
    init: (config: InitConfig) => {
      const { checkin, checkout } = getCheckinCheckoutDates();

      const { selector, placeId, proxyDomain } = config;

      const mapManager = new MapManager(
        new MapboxAdapter(selector, {
          deepLinkConfig: { placeId, checkin, checkout },
        }),
        new LiteApiClient(proxyDomain, { placeId, checkin, checkout })
      );

      mapManager.init();

      return mapManager;
    },
  },
};
