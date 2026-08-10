import type { Trip } from "@/features/trips/types/trip.types";

import { TripCard } from "./trip-card";

export function TripList({ trips }: { trips: Trip[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {trips.map((trip) => (
        <TripCard key={trip.id} trip={trip} />
      ))}
    </div>
  );
}
