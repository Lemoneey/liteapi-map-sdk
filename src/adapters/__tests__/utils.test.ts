import { DOMAIN, OCCUPANCIES } from "../constants";
import { encodeToBase64, generateHotelDetailsPath } from "../utils";

describe("encodeToBase64", () => {
  it("should encode object to base64 correctly", async () => {
    const obj = { a: 1, b: "test" };
    const expected = btoa(JSON.stringify(obj));

    expect(encodeToBase64(obj)).toBe(expected);
  });

  it("should throw an error if btoa is not available", async () => {
    const originalBtoa = globalThis.btoa;
    // @ts-ignore
    delete globalThis.btoa;

    expect(() => encodeToBase64({ x: 1 })).toThrow(
      "Base64 encoding function not available in this environment."
    );
    // @ts-ignore
    globalThis.btoa = originalBtoa;
  });
});

describe("generateHotelDetailsPath", () => {
  it("should generate correct URL with all params", () => {
    const path = generateHotelDetailsPath({
      placeId: "ChIJ123",
      checkin: "2025-10-01",
      checkout: "2025-10-02",
      hotelId: "H123",
    });

    const url = new URL(path);

    expect(url.origin).toBe(DOMAIN);
    expect(url.pathname).toBe("/hotels/H123");
    expect(url.searchParams.get("placeId")).toBe("ChIJ123");
    expect(url.searchParams.get("checkin")).toBe("2025-10-01");
    expect(url.searchParams.get("checkout")).toBe("2025-10-02");

    const decoded = JSON.parse(
      atob(decodeURIComponent(url.searchParams.get("occupancies")!))
    );
    expect(decoded).toEqual(OCCUPANCIES);
  });

  it("should handle missing optional params gracefully", () => {
    const path = generateHotelDetailsPath({ hotelId: "ABC" });
    const url = new URL(path);

    expect(url.searchParams.get("placeId")).toBe("");
    expect(url.searchParams.get("checkin")).toBe("");
    expect(url.searchParams.get("checkout")).toBe("");
  });

  it("should always include encoded occupancies param", () => {
    const path = generateHotelDetailsPath({ hotelId: "XYZ" });
    const url = new URL(path);

    const occupancies = url.searchParams.get("occupancies");
    expect(occupancies).toBeTruthy();

    const decoded = JSON.parse(atob(decodeURIComponent(occupancies!)));
    expect(decoded).toEqual(OCCUPANCIES);
  });
});
