import type { Trip, TripStatus, TripTransportMode } from "../types/trip.types";

const dateTimeFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatTripRoute(trip: Trip) {
  return `${trip.origin.city} -> ${trip.destination.city}`;
}

export function formatTripDate(date: string) {
  return dateTimeFormatter.format(new Date(date));
}

export function formatTripPrice(amountInCents: number, currency: string) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amountInCents / 100);
}

export function formatTripCapacity(availableCapacityKg: number) {
  return `${availableCapacityKg} kg disponibles`;
}

export function getTripStatusLabel(status: TripStatus) {
  switch (status) {
    case "scheduled":
      return "Planifie";
    case "nearly_full":
      return "Presque complet";
    case "completed":
      return "Termine";
    default:
      return status;
  }
}

export function getTripTransportLabel(transportMode: TripTransportMode) {
  switch (transportMode) {
    case "air":
      return "Aerien";
    case "road":
      return "Routier";
    case "sea":
      return "Maritime";
    default:
      return transportMode;
  }
}
