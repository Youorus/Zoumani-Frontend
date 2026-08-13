import type { TripSearchFilters } from "../schemas/trip-search.schema";
import type { SearchTrip } from "../types/search-trip.types";

const searchTripsMock: readonly SearchTrip[] = [
  {
    id: "search-par-abj-001",
    origin: "paris",
    destination: "abidjan",
    departureAt: "2026-08-16T08:40:00.000Z",
    arrivalAt: "2026-08-16T17:25:00.000Z",
    availableCapacityKg: 12,
    pricePerKgCents: 1200,
    currency: "EUR",
    handoverLabel: { fr: "Remise à Paris 15e", en: "Handover in Paris 15th" },
    protectionAvailable: true,
    statusLabel: { fr: "Départ confirmé", en: "Departure confirmed" },
    traveler: {
      name: "Mamadou K.",
      avatarUrl: "/images/home/avatar-2.webp",
      rating: 4.9,
      reviewCount: 48,
      completedTrips: 31,
      points: 1240,
      responseTime: { fr: "Répond en 12 min", en: "Replies in 12 min" },
      verified: true,
    },
  },
  {
    id: "search-par-abj-002",
    origin: "paris",
    destination: "abidjan",
    departureAt: "2026-08-18T13:15:00.000Z",
    arrivalAt: "2026-08-18T22:05:00.000Z",
    availableCapacityKg: 7,
    pricePerKgCents: 1000,
    currency: "EUR",
    handoverLabel: { fr: "Remise proche de CDG", en: "Handover near CDG" },
    protectionAvailable: true,
    statusLabel: { fr: "Plus que 7 kg", en: "Only 7 kg left" },
    traveler: {
      name: "Aïcha D.",
      avatarUrl: "/images/home/avatar-1.webp",
      rating: 5,
      reviewCount: 26,
      completedTrips: 19,
      points: 860,
      responseTime: { fr: "Répond en 25 min", en: "Replies in 25 min" },
      verified: true,
    },
  },
  {
    id: "search-par-abj-003",
    origin: "paris",
    destination: "abidjan",
    departureAt: "2026-08-21T06:30:00.000Z",
    arrivalAt: "2026-08-21T15:20:00.000Z",
    availableCapacityKg: 20,
    pricePerKgCents: 900,
    currency: "EUR",
    handoverLabel: {
      fr: "Remise flexible en Île-de-France",
      en: "Flexible handover near Paris",
    },
    protectionAvailable: true,
    statusLabel: { fr: "Meilleur tarif", en: "Best price" },
    traveler: {
      name: "Serge N.",
      avatarUrl: "/images/home/avatar-4.webp",
      rating: 4.8,
      reviewCount: 67,
      completedTrips: 42,
      points: 1580,
      responseTime: { fr: "Répond en 18 min", en: "Replies in 18 min" },
      verified: true,
    },
  },
  {
    id: "search-bru-dla-001",
    origin: "bruxelles",
    destination: "douala",
    departureAt: "2026-08-20T10:10:00.000Z",
    arrivalAt: "2026-08-20T19:35:00.000Z",
    availableCapacityKg: 15,
    pricePerKgCents: 1100,
    currency: "EUR",
    handoverLabel: {
      fr: "Remise à Bruxelles-Centre",
      en: "Handover in central Brussels",
    },
    protectionAvailable: true,
    statusLabel: { fr: "Départ confirmé", en: "Departure confirmed" },
    traveler: {
      name: "Nadine E.",
      avatarUrl: "/images/home/avatar-3.webp",
      rating: 4.9,
      reviewCount: 35,
      completedTrips: 24,
      points: 1020,
      responseTime: { fr: "Répond en 20 min", en: "Replies in 20 min" },
      verified: true,
    },
  },
];

function waitForMock(delay: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timeoutId = window.setTimeout(resolve, delay);

    signal?.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timeoutId);
        reject(new DOMException("Search cancelled", "AbortError"));
      },
      { once: true },
    );
  });
}

export async function searchTrips(filters: TripSearchFilters, signal?: AbortSignal) {
  await waitForMock(1_250, signal);

  return searchTripsMock.filter(
    (trip) =>
      trip.origin === filters.from &&
      trip.destination === filters.to &&
      trip.availableCapacityKg >= filters.weight,
  );
}
