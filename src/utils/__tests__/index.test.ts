import { generateHotelLngLat, getCheckinCheckoutDates } from "..";

describe("generateHotelLngLat", () => {
  it("should return a new object with lat/lng numbers", () => {
    const center = { lat: 40, lng: 70 };
    const result = generateHotelLngLat(center);

    expect(result).toHaveProperty("lat");
    expect(result).toHaveProperty("lng");
    expect(typeof result.lat).toBe("number");
    expect(typeof result.lng).toBe("number");
  });

  it("should return coordinates close to the original within radius", () => {
    const center = { lat: 40, lng: 70 };
    const radiusKm = 5;
    const result = generateHotelLngLat(center, radiusKm);

    const maxDegrees = radiusKm / 111.32; // 1 degree ≈ 111 km
    expect(Math.abs(result.lat - center.lat)).toBeLessThan(maxDegrees * 2);
    expect(Math.abs(result.lng - center.lng)).toBeLessThan(maxDegrees * 2);
  });
});

describe("getCheckinCheckoutDates", () => {
  const fixedDate = new Date("2024-05-01T10:20:30.000Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return today and tomorrow ISO dates", () => {
    const result = getCheckinCheckoutDates();

    expect(result).toEqual({
      checkin: "2024-05-01",
      checkout: "2024-05-02",
    });
  });

  it("should set checkout exactly one day after checkin", () => {
    const { checkin, checkout } = getCheckinCheckoutDates();

    const checkinDate = new Date(`${checkin}T00:00:00.000Z`);
    const checkoutDate = new Date(`${checkout}T00:00:00.000Z`);

    expect(checkoutDate.getTime() - checkinDate.getTime()).toBe(86400000);
  });
});
