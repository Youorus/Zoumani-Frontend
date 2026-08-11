export interface LocalizedSearchLabel {
  fr: string;
  en: string;
}

export interface SearchTraveler {
  name: string;
  avatarUrl: string;
  rating: number;
  reviewCount: number;
  completedTrips: number;
  points: number;
  responseTime: LocalizedSearchLabel;
  verified: boolean;
}

export interface SearchTrip {
  id: string;
  origin: string;
  destination: string;
  departureAt: string;
  arrivalAt: string;
  availableCapacityKg: number;
  pricePerKgCents: number;
  currency: string;
  handoverLabel: LocalizedSearchLabel;
  protectionAvailable: boolean;
  statusLabel: LocalizedSearchLabel;
  traveler: SearchTraveler;
}
