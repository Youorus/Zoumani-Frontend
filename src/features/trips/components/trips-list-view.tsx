"use client";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";

import { useTrips } from "../hooks/use-trips";
import { TripList } from "./trip-list";

export function TripsListView() {
  const { data, isPending, isError, error, refetch } = useTrips();

  if (isPending) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="panel-surface overflow-hidden p-6">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="mt-4 h-10 w-2/3" />
            <Skeleton className="mt-3 h-5 w-full" />
            <Skeleton className="mt-6 h-20 w-full" />
            <Skeleton className="mt-6 h-10 w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Impossible de charger les voyages"
        description={error.message}
        action={
          <Button type="button" onClick={() => void refetch()}>
            Relancer la requete
          </Button>
        }
      />
    );
  }

  if (!data?.length) {
    return (
      <EmptyState
        title="Aucun voyage disponible"
        description="La feature gère déjà l’état vide sans logique spécifique dans la page."
      />
    );
  }

  return <TripList trips={data} />;
}
