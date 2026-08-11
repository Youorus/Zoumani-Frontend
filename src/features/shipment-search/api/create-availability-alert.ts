import type { TripSearchFilters } from "../schemas/trip-search.schema";
import type { AvailabilityAlertInput } from "../schemas/availability-alert.schema";

export interface AvailabilityAlertPayload extends AvailabilityAlertInput {
  search: TripSearchFilters;
}

export async function createAvailabilityAlert(payload: AvailabilityAlertPayload) {
  await new Promise((resolve) => window.setTimeout(resolve, 850));
  return { id: `alert-${Date.now()}`, email: payload.email };
}
