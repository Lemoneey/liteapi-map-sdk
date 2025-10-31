import { describe, it, expect } from "vitest";
import { normalizePlaceData, normalizeRateData } from "../normalizers";
import { fallbackPlaceData, fallbackRate } from "../constants";

describe("normalizePlaceData", () => {
  it("returns fallback when input is null or not object", () => {
    expect(normalizePlaceData(null)).toEqual(fallbackPlaceData);
    expect(normalizePlaceData("string")).toEqual(fallbackPlaceData);
  });

  it("returns fallback when data is empty object", () => {
    expect(normalizePlaceData({})).toEqual(fallbackPlaceData);
  });

  it("fills missing fields from fallback", () => {
    const input = {
      data: {
        location: { latitude: 10 }, // missing longitude
        viewport: {
          low: { latitude: 40, longitude: undefined },
          high: { latitude: undefined, longitude: 60 },
        },
      },
    };

    const result = normalizePlaceData(input);

    expect(result.location.latitude).toBe(10);
    expect(result.location.longitude).toBe(
      fallbackPlaceData.location.longitude
    );
    expect(result.viewport.low.latitude).toBe(40);
    expect(result.viewport.low.longitude).toBe(
      fallbackPlaceData.viewport.low.longitude
    );
    expect(result.viewport.high.latitude).toBe(
      fallbackPlaceData.viewport.high.latitude
    );
    expect(result.viewport.high.longitude).toBe(60);
  });

  it("returns correct normalized data when all fields are valid", () => {
    const input = {
      data: {
        viewport: {
          high: { latitude: 55, longitude: 77 },
          low: { latitude: 44, longitude: 33 },
        },
        location: { latitude: 50, longitude: 70 },
      },
    };

    const result = normalizePlaceData(input);

    expect(result).toEqual({
      viewport: {
        high: { latitude: 55, longitude: 77 },
        low: { latitude: 44, longitude: 33 },
      },
      location: { latitude: 50, longitude: 70 },
    });
  });

  it("handles completely missing viewport or location gracefully", () => {
    const input = {
      data: {
        viewport: undefined,
        location: undefined,
      },
    };

    const result = normalizePlaceData(input);
    expect(result).toEqual(fallbackPlaceData);
  });

  it("does not mutate fallbackPlaceData", () => {
    const snapshot = structuredClone(fallbackPlaceData);
    normalizePlaceData({});
    expect(fallbackPlaceData).toEqual(snapshot);
  });
});

describe("normalizeRateData", () => {
  it("should return fallback when input is null or not an object", () => {
    expect(normalizeRateData(null)).toEqual(fallbackRate);
    expect(normalizeRateData(42)).toEqual(fallbackRate);
    expect(normalizeRateData("string")).toEqual(fallbackRate);
  });

  it("should normalize fully valid data correctly", () => {
    const raw = {
      data: [
        {
          hotelId: "h1",
          roomTypes: [
            {
              offerRetailRate: {
                amount: 150,
                currency: "EUR",
              },
            },
          ],
        },
      ],
      hotels: [
        {
          id: "h1",
          name: "Hotel One",
          main_photo: "photo.jpg",
          address: "Street 123",
          rating: 4.5,
        },
      ],
    };

    expect(normalizeRateData(raw)).toEqual({
      data: [
        {
          hotelId: "h1",
          roomTypes: [
            {
              offerRetailRate: { amount: 150, currency: "EUR" },
            },
          ],
        },
      ],
      hotels: [
        {
          id: "h1",
          name: "Hotel One",
          main_photo: "photo.jpg",
          address: "Street 123",
          rating: 4.5,
        },
      ],
    });
  });

  it("should normalize data with missing fields", () => {
    const raw = {
      data: [
        {
          roomTypes: [{}],
        },
      ],
      hotels: [
        {
          id: 123, // invalid type
          // name missing
          main_photo: null,
          rating: "bad", // invalid type
        },
      ],
    };

    expect(normalizeRateData(raw)).toEqual({
      data: [
        {
          hotelId: "unknown",
          roomTypes: [
            {
              offerRetailRate: { amount: 0, currency: "USD" },
            },
          ],
        },
      ],
      hotels: [
        {
          id: "123",
          name: "Unnamed Hotel",
          main_photo: "",
          address: "",
          rating: 0,
        },
      ],
    });
  });

  it("should handle completely invalid structure gracefully", () => {
    const raw = {
      data: [123, null, "text"],
      hotels: [false, undefined],
    };

    expect(normalizeRateData(raw)).toEqual({
      data: [
        {
          hotelId: "unknown",
          roomTypes: [],
        },
        {
          hotelId: "unknown",
          roomTypes: [],
        },
        {
          hotelId: "unknown",
          roomTypes: [],
        },
      ],
      hotels: [
        {
          id: "unknown",
          name: "Unnamed Hotel",
          main_photo: "",
          address: "",
          rating: 0,
        },
        {
          id: "unknown",
          name: "Unnamed Hotel",
          main_photo: "",
          address: "",
          rating: 0,
        },
      ],
    });
  });

  it("should return empty arrays when data/hotels fields are missing", () => {
    const raw = {};
    expect(normalizeRateData(raw)).toEqual({ data: [], hotels: [] });
  });
});
