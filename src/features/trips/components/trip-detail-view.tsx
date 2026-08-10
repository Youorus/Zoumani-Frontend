"use client";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useRealtime } from "@/lib/realtime/realtime-provider";

import { useTrip } from "../hooks/use-trip";
import { mapTripToTripDto } from "../schemas/trip.schema";
import { TripDetailCard } from "./trip-detail-card";

export function TripDetailView({ tripId }: { tripId: string }) {
  const { data, isPending, isError, error, refetch } = useTrip(tripId);
  const { emitLocalEvent } = useRealtime();
  const { toast } = useToast();

  if (isPending) {
    return (
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="panel-surface space-y-4 p-6">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <div className="panel-surface space-y-4 p-6">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Impossible de charger le detail du voyage"
        description={error.message}
        action={
          <Button type="button" onClick={() => void refetch()}>
            Reessayer
          </Button>
        }
      />
    );
  }

  if (!data) {
    return (
      <EmptyState
        title="Voyage introuvable"
        description="Le detail n’a pas ete retourne par l’API de reference."
      />
    );
  }

  const simulateRealtimeUpdate = () => {
    const nextCapacity = Math.max(0, data.availableCapacityKg - 2);
    const nextStatus = nextCapacity <= 5 ? "nearly_full" : data.status;

    emitLocalEvent({
      type: "trip:updated",
      payload: mapTripToTripDto({
        ...data,
        availableCapacityKg: nextCapacity,
        status: nextStatus,
      }),
    });

    toast({
      title: "Evenement realtime applique",
      description: "Le cache TanStack Query a ete mis a jour sans fetch manuel.",
      variant: "success",
    });
  };

  return (
    <TripDetailCard
      trip={data}
      action={
        <Button type="button" className="w-full" onClick={simulateRealtimeUpdate}>
          Simuler une mise a jour temps reel
        </Button>
      }
    />
  );
}
