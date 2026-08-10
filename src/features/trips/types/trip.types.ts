export type TripStatus = "scheduled" | "nearly_full" | "completed";
export type TripTransportMode = "air" | "road" | "sea";

export interface TripDto {
  id: string;
  origin_city: string;
  origin_country: string;
  destination_city: string;
  destination_country: string;
  departure_at: string;
  arrival_at: string;
  available_capacity_kg: number;
  price_from_cents: number;
  currency: string;
  status: TripStatus;
  transport_mode: TripTransportMode;
  highlights: string[];
}

export interface Trip {
  id: string;
  origin: {
    city: string;
    country: string;
  };
  destination: {
    city: string;
    country: string;
  };
  departureAt: string;
  arrivalAt: string;
  availableCapacityKg: number;
  priceFromCents: number;
  currency: string;
  status: TripStatus;
  transportMode: TripTransportMode;
  highlights: string[];
}
