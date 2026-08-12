"use client";

import { AuthError } from "@/lib/auth/auth-client";

import {
  toCapacity,
  toCatalog,
  toFlightLookup,
  toOffer,
  type Airport,
  type Capacity,
  type CategoryOffer,
  type Catalog,
  type FlightLookup,
  type RawAirport,
  type RawCapacity,
  type RawCatalog,
  type RawCategoryOffer,
  type RawFlightLookup,
} from "../types/travel.types";

/**
 * Les appels du parcours de voyage, depuis le navigateur.
 *
 * Tous passent par `/api/proxy/…`, donc par le relais de même origine
 * qui ajoute le jeton côté serveur. Ce code ne voit jamais la session :
 * une faille XSS ne permettrait pas de la voler.
 */

const PROXY = "/api/proxy";

async function unwrap(response: Response): Promise<unknown> {
  const payload = (await response.json().catch(() => null)) as {
    error?: { message?: string; details?: { reason?: string; field?: string } };
  } | null;

  if (!response.ok) {
    throw new AuthError(
      payload?.error?.message ?? "Une erreur est survenue.",
      payload?.error?.details?.reason,
      response.status,
      payload?.error?.details?.field,
    );
  }
  return payload;
}

/**
 * Suggère des aéroports pour une frappe.
 *
 * Le classement vient du serveur : code exact d'abord, puis la ville,
 * puis le nom du terrain. Le refaire ici produirait un second ordre,
 * qui divergerait du premier au premier ajustement.
 *
 * Sous deux caractères, on n'appelle même pas : le serveur rendrait une
 * liste vide, autant s'épargner l'aller-retour.
 */
export async function searchAirports(
  query: string,
  signal?: AbortSignal,
): Promise<Airport[]> {
  if (query.trim().length < 2) {
    return [];
  }
  const response = await fetch(`${PROXY}/airports?q=${encodeURIComponent(query)}`, {
    signal,
  });
  return (await unwrap(response)) as RawAirport[] as Airport[];
}

/**
 * Demande à la source si le vol existe, et rend son horaire.
 *
 * **`unavailable` n'est pas un refus.** L'appelant doit le présenter
 * comme « nous n'avons pas pu vérifier », sinon un voyageur honnête
 * croit son vol inexistant un jour de panne.
 */
export async function lookupFlight(input: {
  airlineCode: string;
  flightNumber: string;
  departureDate: string;
  origin: string;
  destination: string;
}): Promise<FlightLookup> {
  const params = new URLSearchParams({
    airline_code: input.airlineCode,
    flight_number: input.flightNumber,
    departure_date: input.departureDate,
    origin: input.origin,
    destination: input.destination,
  });
  const response = await fetch(`${PROXY}/flights/lookup?${params}`, {
    cache: "no-store",
  });
  return toFlightLookup((await unwrap(response)) as RawFlightLookup);
}

/** Les catégories transportables et ce qui ne voyage jamais. */
export async function fetchCatalog(): Promise<Catalog> {
  const response = await fetch(`${PROXY}/parcel-categories`);
  return toCatalog((await unwrap(response)) as RawCatalog);
}

/**
 * Les tarifs pratiqués la fois précédente.
 *
 * Rend un tableau vide au premier voyage. Ce n'est pas une erreur :
 * c'est un début, et l'interface ne doit rien signaler.
 */
export async function fetchLastPrices(): Promise<CategoryOffer[]> {
  const response = await fetch(`${PROXY}/capacities/last-prices`, { cache: "no-store" });
  const payload = (await unwrap(response)) as { offers: RawCategoryOffer[] };
  return payload.offers.map(toOffer);
}

export interface CapacityDraft {
  totalWeightKg: number;
  currency: string;
  offers: { categoryCode: string; priceMinor: number }[];
  notes?: string | null;
}

/** Crée l'offre de capacité d'un voyage vérifié. */
export async function offerCapacity(
  tripId: string,
  draft: CapacityDraft,
): Promise<Capacity> {
  const response = await fetch(`${PROXY}/trips/${tripId}/capacity`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      total_weight_kg: draft.totalWeightKg,
      currency: draft.currency,
      offers: draft.offers.map((offer) => ({
        category_code: offer.categoryCode,
        price_minor: offer.priceMinor,
      })),
      notes: draft.notes ?? null,
    }),
  });
  return toCapacity((await unwrap(response)) as RawCapacity);
}

/** Met l'offre sur le marché. */
export async function publishCapacity(capacityId: string): Promise<Capacity> {
  const response = await fetch(`${PROXY}/capacities/${capacityId}/publish`, {
    method: "POST",
  });
  return toCapacity((await unwrap(response)) as RawCapacity);
}

/** Retire l'offre. Les réservations confirmées survivent. */
export async function withdrawCapacity(capacityId: string): Promise<Capacity> {
  const response = await fetch(`${PROXY}/capacities/${capacityId}/withdraw`, {
    method: "POST",
  });
  return toCapacity((await unwrap(response)) as RawCapacity);
}

export interface SegmentDraft {
  segmentOrder: number;
  airlineCode: string;
  flightNumber: string;
  originAirportCode: string;
  destinationAirportCode: string;
  departureAt: string;
  arrivalAt: string;
}

/** Déclare un voyage : un itinéraire, un ou plusieurs vols. */
export async function declareTrip(segments: SegmentDraft[]): Promise<{ id: string }> {
  const response = await fetch(`${PROXY}/trips`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      segments: segments.map((segment) => ({
        segment_order: segment.segmentOrder,
        airline_code: segment.airlineCode,
        flight_number: segment.flightNumber,
        origin_airport_code: segment.originAirportCode,
        destination_airport_code: segment.destinationAirportCode,
        departure_at: segment.departureAt,
        arrival_at: segment.arrivalAt,
      })),
    }),
  });
  return (await unwrap(response)) as { id: string };
}
