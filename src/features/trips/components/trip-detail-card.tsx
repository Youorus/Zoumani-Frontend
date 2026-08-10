import Link from "next/link";
import type { ReactNode } from "react";

import type { Trip } from "@/features/trips/types/trip.types";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  formatTripCapacity,
  formatTripDate,
  formatTripPrice,
  getTripStatusLabel,
  getTripTransportLabel,
} from "../utils/trip-formatters";

export function TripDetailCard({
  trip,
  action,
}: {
  trip: Trip;
  action?: ReactNode;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <CardHeader>
          <CardTitle>
            {trip.origin.city} {"->"} {trip.destination.city}
          </CardTitle>
          <CardDescription>
            Vue detaillee de la feature de reference branchee sur l’API, TanStack
            Query et le cache realtime.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 rounded-[1.5rem] bg-muted/60 p-4 sm:grid-cols-2">
            <div>
              <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">Depart</p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {trip.origin.city}, {trip.origin.country}
              </p>
              <p className="text-sm text-muted-foreground">{formatTripDate(trip.departureAt)}</p>
            </div>
            <div>
              <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">Arrivee</p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {trip.destination.city}, {trip.destination.country}
              </p>
              <p className="text-sm text-muted-foreground">{formatTripDate(trip.arrivalAt)}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <DetailBlock label="Mode de transport" value={getTripTransportLabel(trip.transportMode)} />
            <DetailBlock label="Statut" value={getTripStatusLabel(trip.status)} />
            <DetailBlock label="Capacite restante" value={formatTripCapacity(trip.availableCapacityKg)} />
            <DetailBlock label="Tarif d’appel" value={formatTripPrice(trip.priceFromCents, trip.currency)} />
          </div>

          <div className="space-y-3">
            <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">Highlights</p>
            <div className="flex flex-wrap gap-2">
              {trip.highlights.map((highlight) => (
                <span
                  key={highlight}
                  className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                >
                  {highlight}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sandbox d’architecture</CardTitle>
          <CardDescription>
            Cette colonne prouve qu’une feature peut brancher actions UI, cache et
            realtime sans casser le design system.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-[1.5rem] border border-border bg-background/80 p-4">
            <p className="text-sm leading-7 text-muted-foreground">
              Le bouton ci-dessous emet un evenement `trip:updated`. Le provider
              realtime applique alors la mise a jour dans TanStack Query, ce qui
              rerend la page sans refetch manuel du composant.
            </p>
          </div>

          {action}

          <Button asChild variant="outline" className="w-full">
            <Link href="/trips">Retour a la liste</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-border bg-background/80 p-4">
      <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">{label}</p>
      <p className="mt-2 text-base font-semibold text-foreground">{value}</p>
    </div>
  );
}
