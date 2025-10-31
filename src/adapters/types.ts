interface Coordinates {
  latitude: number;
  longitude: number;
}

interface BoundingBox {
  high: Coordinates;
  low: Coordinates;
}

export interface ViewConfig {
  location: Coordinates;
  viewport: BoundingBox;
}

export interface HotelData extends Coordinates {
  id: string;
  price: number;
  currency: string;
  name: string;
}

export interface MapboxAdapterOptions {
  deepLinkConfig?: { placeId?: string; checkin?: string; checkout?: string };
}

export interface MapAdapter {
  toggleHeatmap(flag: boolean): void;
  setHeatmap(hotels: HotelData[]): void;
  setMarkers(hotels: HotelData[]): void;
  setLoading(flag: boolean): void;
  render(viewConfig: ViewConfig): void;
}
