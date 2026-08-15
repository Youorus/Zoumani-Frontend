"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { findAirportByCode, updateItinerary } from "../api/travel-client";
import type { Trip } from "../types/trip.types";
import { FlightStep, toSegmentDrafts, type FlightChoice } from "./flight-step";

interface EditItineraryViewProps {
  trip: Trip;
}

/**
 * Modifie l'itinéraire entier, escales comprises.
 *
 * Création et correction partagent volontairement le même constructeur :
 * mêmes suggestions Zoumani, même validation des vols et un seul contrat
 * de traduction vers l'API. Une correction ne peut donc pas produire un
 * voyage que l'écran de création aurait refusé.
 */
export function EditItineraryView({ trip }: EditItineraryViewProps) {
  const router = useRouter();
  const [initialFlights, setInitialFlights] = useState<FlightChoice[] | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    if (!trip.isEditable) {
      return;
    }
    let active = true;

    void Promise.all(
      trip.segments.map(async (segment) => {
        const [origin, destination] = await Promise.all([
          findAirportByCode(segment.originAirportCode),
          findAirportByCode(segment.destinationAirportCode),
        ]);
        if (!origin || !destination) {
          throw new Error("Un aéroport de cet itinéraire n'est plus disponible.");
        }
        return {
          origin,
          destination,
          airlineCode: segment.airlineCode,
          flightNumber: segment.flightNumber,
          departureDate: segment.departureAt.slice(0, 10),
          lookup: {
            outcome: "confirmed" as const,
            schedule: {
              departureAt: segment.departureAt,
              arrivalAt: segment.arrivalAt,
              flightDesignator: `${segment.airlineCode}${segment.flightNumber}`,
            },
          },
        };
      }),
    )
      .then((flights) => {
        if (active) {
          setInitialFlights(flights);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setFailure(
            error instanceof Error
              ? error.message
              : "L'itinéraire n'a pas pu être chargé.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, [trip.isEditable, trip.segments]);

  if (!trip.isEditable) {
    return <NonModifiable />;
  }

  async function save(flights: FlightChoice[]) {
    setIsSaving(true);
    setFailure(null);
    try {
      await updateItinerary(trip.id, toSegmentDrafts(flights));
      router.push(`/trips/${trip.id}`);
      router.refresh();
    } catch (error) {
      setFailure(
        error instanceof Error ? error.message : "L'enregistrement n'a pas abouti.",
      );
      setIsSaving(false);
    }
  }

  if (failure && initialFlights === null) {
    return (
      <div className="mx-auto max-w-xl px-5 py-16 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
          Itinéraire indisponible
        </p>
        <h1 className="mt-3 text-2xl font-semibold">
          Nous n&apos;avons pas pu ouvrir ce voyage
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">{failure}</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="mt-6 rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground"
        >
          Revenir au voyage
        </button>
      </div>
    );
  }

  if (initialFlights === null) {
    return <ItineraryLoading />;
  }

  return (
    <>
      <FlightStep
        initialFlights={initialFlights}
        onConfirmed={(flights) => void save(flights)}
        onBack={() => router.push(`/trips/${trip.id}`)}
        title="Ajustez votre itinéraire"
        hint="Modifiez seulement ce qui a changé. Chaque nouveau tronçon sera reconfirmé avant l'enregistrement."
        confirmedLabel="Enregistrer tout l'itinéraire"
        isSubmitting={isSaving}
      />
      {failure && (
        <div
          className="fixed inset-x-4 bottom-24 z-30 mx-auto max-w-xl rounded-xl border border-error/30 bg-surface p-3 text-sm text-error shadow-lg"
          role="alert"
        >
          {failure}
        </div>
      )}
    </>
  );
}

function ItineraryLoading() {
  return (
    <div className="mx-auto grid min-h-[60vh] max-w-xl place-items-center px-5 text-center">
      <div>
        <span className="mx-auto block size-11 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        <p className="mt-4 font-display text-xl">Nous retraçons votre voyage…</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Vols, escales et horaires reviennent à leur place.
        </p>
      </div>
    </div>
  );
}

function NonModifiable() {
  return (
    <div className="mx-auto w-full max-w-xl px-5 py-16 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
        Dossier protégé
      </p>
      <h1 className="mt-3 text-2xl font-semibold">Ce voyage est entre de bonnes mains</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        L&apos;équipe est en train de le contrôler ou une décision a déjà été prise. Le
        figer garantit que personne ne vérifie des informations qui changent en même
        temps.
      </p>
    </div>
  );
}
