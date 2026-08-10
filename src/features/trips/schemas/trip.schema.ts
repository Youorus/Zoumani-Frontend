import { z } from "zod";

import type { Trip, TripDto } from "@/features/trips/types/trip.types";

export const tripStatusSchema = z.enum(["scheduled", "nearly_full", "completed"]);
export const tripTransportModeSchema = z.enum(["air", "road", "sea"]);

export const tripDtoSchema = z.object({
  id: z.string(),
  origin_city: z.string(),
  origin_country: z.string(),
  destination_city: z.string(),
  destination_country: z.string(),
  departure_at: z.string().datetime(),
  arrival_at: z.string().datetime(),
  available_capacity_kg: z.number().nonnegative(),
  price_from_cents: z.number().nonnegative(),
  currency: z.string().length(3),
  status: tripStatusSchema,
  transport_mode: tripTransportModeSchema,
  highlights: z.array(z.string()),
});

export const tripListDtoSchema = z.array(tripDtoSchema);

export function mapTripDtoToTrip(dto: TripDto): Trip {
  return {
    id: dto.id,
    origin: {
      city: dto.origin_city,
      country: dto.origin_country,
    },
    destination: {
      city: dto.destination_city,
      country: dto.destination_country,
    },
    departureAt: dto.departure_at,
    arrivalAt: dto.arrival_at,
    availableCapacityKg: dto.available_capacity_kg,
    priceFromCents: dto.price_from_cents,
    currency: dto.currency,
    status: dto.status,
    transportMode: dto.transport_mode,
    highlights: dto.highlights,
  };
}

export function mapTripToTripDto(trip: Trip): TripDto {
  return {
    id: trip.id,
    origin_city: trip.origin.city,
    origin_country: trip.origin.country,
    destination_city: trip.destination.city,
    destination_country: trip.destination.country,
    departure_at: trip.departureAt,
    arrival_at: trip.arrivalAt,
    available_capacity_kg: trip.availableCapacityKg,
    price_from_cents: trip.priceFromCents,
    currency: trip.currency,
    status: trip.status,
    transport_mode: trip.transportMode,
    highlights: trip.highlights,
  };
}
