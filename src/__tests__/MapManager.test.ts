import { Mock } from "vitest";
import { MapManager } from "../MapManager";
import { generateHotelLngLat } from "../utils";

vi.mock("../utils", () => ({
  generateHotelLngLat: vi.fn(() => ({ lat: 10, lng: 20 })),
}));

describe("MapManager", () => {
  let mockAdapter: {
    render: Mock;
    setLoading: Mock;
    setMarkers: Mock;
    setHeatmap: Mock;
    toggleHeatmap: Mock;
  };
  let mockApiClient: {
    getPlaceData: Mock;
    getRates: Mock;
  };
  let manager: MapManager;

  beforeEach(() => {
    mockAdapter = {
      render: vi.fn(),
      setLoading: vi.fn(),
      setMarkers: vi.fn(),
      setHeatmap: vi.fn(),
      toggleHeatmap: vi.fn(),
    };

    mockApiClient = {
      getPlaceData: vi.fn(),
      getRates: vi.fn(),
    };

    manager = new MapManager(mockAdapter as never, mockApiClient as never);
    vi.clearAllMocks();
  });

  it("calls render, setLoading, setMarkers, and setHeatmap during init()", async () => {
    const mockPlaceData = {
      location: { latitude: 50, longitude: 30 },
      viewport: {},
    };
    const mockHotels = [{ id: "h1", price: 100 }];

    mockApiClient.getPlaceData.mockResolvedValue(mockPlaceData);
    mockApiClient.getRates.mockResolvedValue(mockHotels);

    const result = await manager.init();

    expect(result).toBe(manager);

    expect(mockApiClient.getPlaceData).toHaveBeenCalled();

    await new Promise((resolve) => setTimeout(resolve));

    expect(mockAdapter.render).toHaveBeenCalledWith(mockPlaceData);
    expect(mockAdapter.setLoading).toHaveBeenCalledWith(true);

    await new Promise((resolve) => setTimeout(resolve));

    expect(mockApiClient.getRates).toHaveBeenCalled();
    expect(mockAdapter.setLoading).toHaveBeenCalledWith(false);

    const expectedHotels = [
      { id: "h1", price: 100, latitude: 10, longitude: 20 },
    ];

    expect(mockAdapter.setMarkers).toHaveBeenCalledWith(expectedHotels);
    expect(mockAdapter.setHeatmap).toHaveBeenCalledWith(expectedHotels);
  });

  it("does nothing if init() called twice", async () => {
    mockApiClient.getPlaceData.mockResolvedValue({ location: {} });
    mockApiClient.getRates.mockResolvedValue([]);

    await manager.init();
    await manager.init();

    expect(mockApiClient.getPlaceData).toHaveBeenCalledTimes(1);
    expect(mockAdapter.render).toHaveBeenCalledTimes(1);
  });

  it("toggleMapHeatmap() calls adapter.toggleHeatmap only after init", async () => {
    manager.toggleMapHeatmap(true);
    expect(mockAdapter.toggleHeatmap).not.toHaveBeenCalled();

    mockApiClient.getPlaceData.mockResolvedValue({ location: {} });
    mockApiClient.getRates.mockResolvedValue([]);
    await manager.init();

    manager.toggleMapHeatmap(true);
    expect(mockAdapter.toggleHeatmap).toHaveBeenCalledWith(true);
  });
});
