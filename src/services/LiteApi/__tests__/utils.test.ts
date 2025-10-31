import type { HotelRates } from "../types";
import { mergeHotels } from "../utils";

describe("mergeHotels", () => {
  it("should return empty array if input is null", () => {
    // @ts-expect-error invalid structure
    expect(mergeHotels(null)).toEqual([]);
  });

  it("should return empty array if data or hotels are not arrays", () => {
    // @ts-expect-error invalid structure
    expect(mergeHotels({ data: null, hotels: [] })).toEqual([]);
    // @ts-expect-error invalid structure
    expect(mergeHotels({ data: [], hotels: null })).toEqual([]);
  });

  it("should skip hotels that have no matching overview", () => {
    const input: HotelRates = {
      data: [
        {
          hotelId: "h1",
          roomTypes: [{ offerRetailRate: { amount: 100, currency: "USD" } }],
        },
      ],
      hotels: [
        { id: "h2", name: "Hotel 2", main_photo: "", address: "", rating: 5 },
      ],
    };

    expect(mergeHotels(input)).toEqual([]);
  });

  it("should skip hotels with invalid or missing rates", () => {
    const input: HotelRates = {
      data: [
        {
          hotelId: "h1",
          roomTypes: [
            { offerRetailRate: { amount: NaN, currency: "USD" } },
            { offerRetailRate: { amount: null as any, currency: "USD" } },
          ],
        },
      ],
      hotels: [
        { id: "h1", name: "Hotel 1", main_photo: "", address: "", rating: 4 },
      ],
    };

    expect(mergeHotels(input)).toEqual([]);
  });

  it("should merge hotels correctly with valid data", () => {
    const input: HotelRates = {
      data: [
        {
          hotelId: "h1",
          roomTypes: [
            { offerRetailRate: { amount: 150, currency: "USD" } },
            { offerRetailRate: { amount: 120, currency: "USD" } },
            { offerRetailRate: { amount: 200, currency: "USD" } },
          ],
        },
      ],
      hotels: [
        { id: "h1", name: "Hotel 1", main_photo: "", address: "", rating: 4 },
      ],
    };

    const result = mergeHotels(input);

    expect(result).toMatchObject([
      {
        id: "h1",
        name: "Hotel 1",
        price: 120,
        currency: "USD",
      },
    ]);
  });

  it("should merge multiple hotels", () => {
    const input: HotelRates = {
      data: [
        {
          hotelId: "h1",
          roomTypes: [
            { offerRetailRate: { amount: 300, currency: "EUR" } },
            { offerRetailRate: { amount: 250, currency: "EUR" } },
          ],
        },
        {
          hotelId: "h2",
          roomTypes: [
            { offerRetailRate: { amount: 100, currency: "USD" } },
            { offerRetailRate: { amount: 90, currency: "USD" } },
          ],
        },
      ],
      hotels: [
        { id: "h1", name: "Hotel A", main_photo: "", address: "", rating: 4 },
        { id: "h2", name: "Hotel B", main_photo: "", address: "", rating: 5 },
      ],
    };

    const result = mergeHotels(input);

    expect(result).toMatchObject([
      { id: "h1", name: "Hotel A", price: 250, currency: "EUR" },
      { id: "h2", name: "Hotel B", price: 90, currency: "USD" },
    ]);
  });
});
