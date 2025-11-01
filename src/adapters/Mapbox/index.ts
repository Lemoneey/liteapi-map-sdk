import mapboxgl from "mapbox-gl";
import type {
  MapAdapter,
  HotelData,
  ViewConfig,
  MapboxAdapterOptions,
} from "../types";
import "mapbox-gl/dist/mapbox-gl.css";
import { renderPopup } from "../renderPopup";

mapboxgl.accessToken =
  "pk.eyJ1Ijoiam9obmRvZTEyM3F3ZWFzZCIsImEiOiJjbWhkMWllajAyNmZnMmlwYzNyYnI1NGV6In0.oajwFef2Npj3VOwcFBNlqg";

const HOTEL_PRICES_ID = "hotel-prices";
const HOTEL_HEATMAP_ID = "hotel-heatmap";

export class MapboxAdapter implements MapAdapter {
  private options: MapboxAdapterOptions = {};
  private loadingContainer?: HTMLDivElement;
  private mapContainer?: HTMLElement;
  private mapContainerSelector: string;
  private map: mapboxgl.Map | null = null;

  constructor(selector: string, options?: MapboxAdapterOptions) {
    this.mapContainerSelector = selector;
    this.options = options || {};
  }

  private isMap() {
    if (!this.map) {
      console.error("Map instance not founded");
      return false;
    }
    return true;
  }

  private setupControls() {
    if (!this.isMap()) return;
    this.map!.addControl(new mapboxgl.NavigationControl());
  }

  private mountMap(viewConfig: ViewConfig) {
    const container = document.querySelector<HTMLElement>(
      this.mapContainerSelector
    );

    if (!container) {
      throw new Error(
        `Container with id ${this.mapContainerSelector} not found`
      );
    }

    this.mapContainer = container;

    const { location, viewport } = viewConfig;

    this.map = new mapboxgl.Map({
      container,
      style: "mapbox://styles/mapbox/streets-v12",
      center: {
        lat: location.latitude,
        lng: location.longitude,
      },
      bounds: [
        [viewport.low.longitude, viewport.low.latitude],
        [viewport.high.longitude, viewport.high.latitude],
      ],
      minZoom: 5,
    });
  }

  public setHeatmap(hotels: HotelData[]) {
    if (!this.isMap()) return;
    const map = this.map!;

    const features = hotels.map((hotel) => {
      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [hotel.longitude, hotel.latitude],
        },
        properties: {
          price: hotel.price,
        },
      };
    });

    const geojson = {
      type: "FeatureCollection",
      features,
    } as GeoJSON.FeatureCollection;

    if (map.getSource(HOTEL_PRICES_ID)) {
      (map.getSource(HOTEL_PRICES_ID) as mapboxgl.GeoJSONSource).setData(
        geojson
      );
    } else {
      map.addSource(HOTEL_PRICES_ID, {
        type: "geojson",
        data: geojson,
      });

      map.addLayer({
        id: HOTEL_HEATMAP_ID,
        type: "heatmap",
        source: HOTEL_PRICES_ID,
        maxzoom: 15,
        paint: {
          "heatmap-weight": [
            "interpolate",
            ["linear"],
            ["get", "price"],
            0,
            0,
            100,
            1,
            200,
            1.5,
            300,
            2,
            400,
            2.5,
          ],
          "heatmap-intensity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            0,
            1,
            15,
            3,
          ],
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(33,102,172,0)",
            0.2,
            "rgb(103,169,207)",
            0.4,
            "rgb(209,229,240)",
            0.6,
            "rgb(253,219,199)",
            0.8,
            "rgb(239,138,98)",
            1,
            "rgb(178,24,43)",
          ],
          "heatmap-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            0,
            3,
            10,
            20,
            15,
            35,
          ],
          "heatmap-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10,
            1,
            12,
            0.5,
            13,
            0.2,
            14,
            0,
          ],
        },
      });

      map.addLayer({
        id: "hotel-points",
        type: "circle",
        source: HOTEL_PRICES_ID,
        minzoom: 14,
        paint: {
          "circle-radius": 4,
          "circle-color": "rgba(0,0,0,0.5)",
          "circle-stroke-color": "white",
          "circle-stroke-width": 1,
        },
      });
    }
  }

  public toggleHeatmap(flag: boolean): void {
    if (!this.isMap()) return;

    const thisMap = this.map!;

    if (!thisMap.getLayer(HOTEL_HEATMAP_ID)) return;

    thisMap.setLayoutProperty(
      HOTEL_HEATMAP_ID,
      "visibility",
      flag ? "visible" : "none"
    );
  }

  private calculateMarkerOpacity(zoomLevel: number) {
    const startFade = 11;
    const endFade = 13;

    let opacity = 1;

    if (zoomLevel < startFade) {
      opacity = 0;
    } else if (zoomLevel < endFade) {
      opacity = (zoomLevel - startFade) / (endFade - startFade);
    }

    return opacity;
  }

  private initLoadingIndicator() {
    if (!this.mapContainer) return;

    this.loadingContainer = document.createElement("div");
    this.loadingContainer.className = "loading-container";

    const loadingIndicator = document.createElement("div");
    loadingIndicator.className = "loading-indicator";
    loadingIndicator.innerText = "Loading...";

    this.loadingContainer.appendChild(loadingIndicator);
    this.mapContainer.appendChild(this.loadingContainer);
  }

  public setLoading(flag: boolean) {
    if (!this.loadingContainer) this.initLoadingIndicator();
    this.loadingContainer!.style.display = flag ? "block" : "none";
  }

  public setMarkers(hotels: HotelData[]) {
    if (!this.isMap()) return;

    const thisMap = this.map!;

    const updateElementOpacity = (el: HTMLElement, opacity: number) => {
      el.style.opacity = opacity.toString();
      el.style.pointerEvents = opacity > 0.5 ? "auto" : "none";
    };

    hotels.forEach((hotel) => {
      const popup = renderPopup(hotel, this.options?.deepLinkConfig);
      const opacity = this.calculateMarkerOpacity(thisMap.getZoom());

      updateElementOpacity(popup.querySelector(".popup")!, opacity);

      new mapboxgl.Marker({
        element: popup,
      })
        .setLngLat([hotel.longitude, hotel.latitude])
        .addTo(thisMap);
    });

    thisMap.on("zoom", () => {
      const zoom = thisMap.getZoom();
      const opacity = this.calculateMarkerOpacity(zoom);

      document
        .querySelectorAll<HTMLElement>(`${this.mapContainerSelector} .popup`)
        .forEach((el) => {
          updateElementOpacity(el, opacity);
        });
    });
  }

  public async render(viewConfig: ViewConfig): Promise<void> {
    if (!this.map) {
      this.mountMap(viewConfig);
      this.setupControls();
    }
  }
}
