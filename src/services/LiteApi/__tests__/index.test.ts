import { LiteApiClient } from "..";
import { normalizePlaceData, normalizeRateData } from "../normalizers";
import { mergeHotels } from "../utils";

vi.mock("../normalizers", () => ({
  normalizePlaceData: vi.fn().mockReturnValue("normalizedPlaceData"),
  normalizeRateData: vi.fn().mockReturnValue("normalizedRateData"),
}));

vi.mock("../utils", () => ({
  mergeHotels: vi.fn().mockReturnValue("mergedHotels"),
}));

describe("LiteApiClient", () => {
  const proxyDomain = "example.com";
  const config = {
    placeId: "ChIJ123",
    checkin: "2025-10-31",
    checkout: "2025-11-01",
  };

  let client: LiteApiClient;

  beforeEach(() => {
    client = new LiteApiClient(proxyDomain, config);
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  describe("getPlaceData", () => {
    it("should call fetch with correct URL and return normalized data", async () => {
      const mockData = { viewport: { low: {}, high: {} } };

      (globalThis.fetch as any) = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData),
        })
      );

      const result = await client.getPlaceData();

      expect(fetch).toHaveBeenCalledWith(
        `https://${proxyDomain}/places/${config.placeId}`,
        expect.objectContaining({ method: "GET" })
      );

      expect(normalizePlaceData).toHaveBeenCalledWith(mockData);
      expect(result).toEqual("normalizedPlaceData");
    });

    it("should throw an error when fetch fails", async () => {
      (globalThis.fetch as any) = vi.fn(() =>
        Promise.reject(new Error("network fail"))
      );

      await expect(client.getPlaceData()).rejects.toThrow(
        /Failed to reach proxy server/
      );
    });
  });

  describe("getRates", () => {
    it("should call POST with proper payload and return merged data", async () => {
      const mockResponse = { data: [] };

      (globalThis.fetch as any) = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        })
      );

      const result = await client.getRates();

      expect(fetch).toHaveBeenCalledWith(
        `https://${proxyDomain}/hotels/rates`,
        expect.objectContaining({
          method: "POST",
        })
      );

      const callArgs = (fetch as any).mock.calls[0][1];
      const body = JSON.parse(callArgs.body);
      expect(body).toMatchObject({
        placeId: config.placeId,
        checkin: config.checkin,
        checkout: config.checkout,
      });

      expect(normalizeRateData).toHaveBeenCalledWith(mockResponse);
      expect(mergeHotels).toHaveBeenCalledWith("normalizedRateData");
      expect(result).toEqual("mergedHotels");
    });

    it("should throw error if response not ok", async () => {
      (globalThis.fetch as any) = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ message: "server error" }),
        })
      );

      await expect(client.getRates()).rejects.toThrow(
        /Failed to reach proxy server/
      );
    });
  });
});
