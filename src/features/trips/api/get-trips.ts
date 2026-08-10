import { apiClient } from "@/lib/api/api-client";

import { mapTripDtoToTrip, tripListDtoSchema } from "../schemas/trip.schema";

export async function getTrips() {
  const response = await apiClient.get<unknown>("/trips");
  const parsedResponse = tripListDtoSchema.parse(response);

  return parsedResponse.map(mapTripDtoToTrip);
}
