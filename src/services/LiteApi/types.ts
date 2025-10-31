export interface RoomType {
  offerRetailRate: {
    amount: number;
    currency: string;
  };
}

export interface Hotel {
  hotelId: string;
  roomTypes: RoomType[];
}

export interface HotelOverview {
  id: string;
  name: string;
  main_photo: string;
  address: string;
  rating: number;
}

export interface HotelRates {
  data: Hotel[];
  hotels: HotelOverview[];
}

export interface ApiConfig {
  placeId: string;
  checkin: string;
  checkout: string;
}
