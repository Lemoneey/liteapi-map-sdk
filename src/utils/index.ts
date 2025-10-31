export function generateHotelLngLat<T extends { lng: number; lat: number }>(
  center: T,
  radiusKm = 10
): T {
  const { lat, lng } = center;

  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.sqrt(Math.random()) * radiusKm;

  const kmPerDegreeLat = 111.32; // ~111.32 km
  const kmPerDegreeLng = 111.32 * Math.cos((lat * Math.PI) / 180);

  const deltaLat = distance / kmPerDegreeLat;
  const deltaLng = distance / kmPerDegreeLng;

  const newLat = lat + deltaLat * Math.cos(angle);
  const newLng = lng + deltaLng * Math.sin(angle);

  return { lat: newLat, lng: newLng } as T;
}

export function getCheckinCheckoutDates() {
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  return { checkin: today, checkout: tomorrow };
}
