import { apiClient } from "@/lib/api/api-client";

import { mapTripDtoToTrip, tripDtoSchema } from "../schemas/trip.schema";

export async function getTripDetail(tripId: string) {
  const response = await apiClient.get<unknown>(`/trips/${tripId}`);
  const parsedResponse = tripDtoSchema.parse(response);

  return mapTripDtoToTrip(parsedResponse);
}
