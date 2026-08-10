import Link from "next/link";

import type { Trip } from "@/features/trips/types/trip.types";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  formatTripCapacity,
  formatTripDate,
  formatTripPrice,
  formatTripRoute,
  getTripStatusLabel,
  getTripTransportLabel,
} from "../utils/trip-formatters";

const statusVariant = {
  scheduled: "success",
  nearly_full: "warning",
  completed: "surface",
} as const;

interface TripCardProps {
  trip: Trip;
}

export function TripCard({ trip }: TripCardProps) {
  return (
    <Link href={`/trips/${trip.id}`} className="block">
      <Card className="interactive-surface h-full overflow-hidden">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary">{getTripTransportLabel(trip.transportMode)}</Badge>
            <Badge variant={statusVariant[trip.status]}>{getTripStatusLabel(trip.status)}</Badge>
          </div>
          <CardTitle>{formatTripRoute(trip)}</CardTitle>
          <CardDescription>
            Depart {formatTripDate(trip.departureAt)} • Arrivee {formatTripDate(trip.arrivalAt)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Capacite</span>
            <span className="font-semibold text-foreground">
              {formatTripCapacity(trip.availableCapacityKg)}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {trip.highlights.map((highlight) => (
              <span
                key={highlight}
                className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
              >
                {highlight}
              </span>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <span className="text-sm text-muted-foreground">A partir de</span>
          <span className="font-display text-2xl text-foreground">
            {formatTripPrice(trip.priceFromCents, trip.currency)}
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
