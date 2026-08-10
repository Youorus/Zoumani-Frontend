import type { RealtimeEventHandler } from "@/lib/realtime/events";

import { mapTripDtoToTrip, tripDtoSchema } from "../schemas/trip.schema";
import { tripQueryKeys } from "../queries/trip-query-keys";
import type { Trip } from "../types/trip.types";

export const tripRealtimeHandlers: RealtimeEventHandler[] = [
  {
    type: "trip:updated",
    handle: ({ event, queryClient }) => {
      const parsedTrip = tripDtoSchema.safeParse(event.payload);

      if (!parsedTrip.success) {
        return;
      }

      const nextTrip = mapTripDtoToTrip(parsedTrip.data);

      queryClient.setQueryData(tripQueryKeys.detail(nextTrip.id), nextTrip);
      queryClient.setQueryData<Trip[] | undefined>(tripQueryKeys.lists(), (currentTrips) =>
        currentTrips?.map((trip) => (trip.id === nextTrip.id ? nextTrip : trip)),
      );
    },
  },
];
