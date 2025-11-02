import type { MapAdapter } from "./adapters/types";
import type { ApiClient } from "./services/types";
import { generateHotelLngLat } from "./utils";

export class MapManager {
  private mapAdapter: MapAdapter;
  private apiClient: ApiClient;
  private isInitialized = false;

  constructor(adapter: MapAdapter, apiClient: ApiClient) {
    this.mapAdapter = adapter;
    this.apiClient = apiClient;
  }

  private async loadViewport() {
    const placeData = await this.apiClient.getPlaceData();
    return placeData;
  }

  private async loadHotels() {
    const ratesData = await this.apiClient.getRates();
    return ratesData;
  }

  public toggleMapHeatmap(flag: boolean) {
    if (!this.isInitialized) return;

    this.mapAdapter.toggleHeatmap(flag);
  }

  public async init() {
    if (this.isInitialized) return this;

    this.isInitialized = true;

    this.loadViewport().then((placeData) => {
      this.mapAdapter.render(placeData);
      this.mapAdapter.setLoading(true);

      this.loadHotels().then((ratesData) => {
        this.mapAdapter.setLoading(false);

        //TODO: (hack/workaround) Since /hotels/rates endpoint doesn't return location of hotel
        const hotelRatesWithGeneratedLocation = ratesData.map((hotel) => {
          const { lat, lng } = generateHotelLngLat({
            lng: placeData.location.longitude,
            lat: placeData.location.latitude,
          });
          return {
            ...hotel,
            latitude: lat,
            longitude: lng,
          };
        });

        this.mapAdapter.setHeatmap(hotelRatesWithGeneratedLocation);
        this.mapAdapter.setMarkers(hotelRatesWithGeneratedLocation);
      });
    });

    return this;
  }
}
