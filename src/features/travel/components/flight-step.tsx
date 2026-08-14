"use client";

import { useState } from "react";

import { DateField } from "@/components/ui/date-field";

import { lookupFlight, type SegmentDraft } from "../api/travel-client";
import type { Airline, Airport, FlightLookup } from "../types/travel.types";
import { AirlineField } from "./airline-field";
import { AirportField } from "./airport-field";
import { WizardShell } from "./wizard-shell";

export interface FlightChoice {
  origin: Airport;
  destination: Airport;
  airlineCode: string;
  flightNumber: string;
  departureDate: string;
  lookup: FlightLookup;
}

interface FlightStepProps {
  onConfirmed: (flights: FlightChoice[]) => void;
  initialFlights?: FlightChoice[];
  onBack?: () => void;
  title?: string;
  hint?: string;
  confirmedLabel?: string;
  isSubmitting?: boolean;
}

interface FlightDraft {
  id: string;
  origin: Airport | null;
  destination: Airport | null;
  airline: Airline | null;
  airlineFallback: string;
  flightNumber: string;
  departureDate: string;
  lookup: FlightLookup | null;
  isChecking: boolean;
}

const MAX_SEGMENTS = 3;

function emptyFlight(id: string, origin: Airport | null = null): FlightDraft {
  return {
    id,
    origin,
    destination: null,
    airline: null,
    airlineFallback: "",
    flightNumber: "",
    departureDate: "",
    lookup: null,
    isChecking: false,
  };
}

/**
 * Construit un itinéraire direct ou avec correspondances.
 *
 * Chaque tronçon est confirmé indépendamment auprès de la compagnie.
 * L'arrivée d'un vol devient automatiquement le départ du suivant : la
 * personne ne ressaisit rien et il est impossible de créer un itinéraire
 * discontinu par inadvertance.
 */
export function FlightStep({
  onConfirmed,
  initialFlights = [],
  onBack,
  title = "Racontez-nous votre itinéraire",
  hint = "Un vol direct ou quelques escales : Zoumani vérifie chaque tronçon, sans vous faire saisir les heures.",
  confirmedLabel = "Continuer avec cet itinéraire",
  isSubmitting = false,
}: FlightStepProps) {
  const [flights, setFlights] = useState<FlightDraft[]>(() =>
    initialFlights.length > 0
      ? initialFlights.map(toFlightDraft)
      : [emptyFlight("flight-1")],
  );
  const [failure, setFailure] = useState<string | null>(null);

  const allComplete = flights.every(isComplete);
  const allChecked = flights.every((flight) => flight.lookup !== null);
  const hasMissingFlight = flights.some((flight) => flight.lookup?.outcome === "not_found");
  const isChecking = flights.some((flight) => flight.isChecking);

  function updateFlight(id: string, update: Partial<FlightDraft>) {
    setFlights((current) => {
      const index = current.findIndex((flight) => flight.id === id);
      if (index < 0) {
        return current;
      }
      const next = [...current];
      next[index] = { ...next[index], ...update, lookup: null };

      // La route reste d'un seul tenant, même après la modification
      // d'une escale déjà renseignée.
      if ("destination" in update && next[index + 1]) {
        next[index + 1] = {
          ...next[index + 1],
          origin: update.destination ?? null,
          lookup: null,
        };
      }
      return next;
    });
  }

  async function checkFlight(flight: FlightDraft): Promise<void> {
    if (!isComplete(flight) || !flight.origin || !flight.destination) {
      return;
    }
    setFlights((current) =>
      current.map((item) =>
        item.id === flight.id ? { ...item, isChecking: true } : item,
      ),
    );
    try {
      const result = await lookupFlight({
        airlineCode: airlineCodeOf(flight),
        flightNumber: flight.flightNumber.trim(),
        departureDate: flight.departureDate,
        origin: flight.origin.iata,
        destination: flight.destination.iata,
      });
      setFlights((current) =>
        current.map((item) =>
          item.id === flight.id ? { ...item, lookup: result, isChecking: false } : item,
        ),
      );
    } catch {
      // Une source indisponible envoie le dossier à l'examen humain ; elle
      // ne doit jamais accuser le voyageur d'avoir inventé son vol.
      setFlights((current) =>
        current.map((item) =>
          item.id === flight.id
            ? {
                ...item,
                lookup: { outcome: "unavailable", schedule: null },
                isChecking: false,
              }
            : item,
        ),
      );
      setFailure(
        "Une source n'a pas répondu. Ce tronçon sera contrôlé humainement.",
      );
    }
  }

  async function checkAll() {
    setFailure(null);
    await Promise.all(
      flights.filter((flight) => flight.lookup === null).map(checkFlight),
    );
  }

  function continueToOffer() {
    const choices = flights.flatMap((flight) => {
      if (!flight.origin || !flight.destination || !flight.lookup) {
        return [];
      }
      return [
        {
          origin: flight.origin,
          destination: flight.destination,
          airlineCode: airlineCodeOf(flight),
          flightNumber: flight.flightNumber.trim(),
          departureDate: flight.departureDate,
          lookup: flight.lookup,
        },
      ];
    });
    if (choices.length === flights.length) {
      onConfirmed(choices);
    }
  }

  return (
    <WizardShell
      step={1}
      total={5}
      title={title}
      hint={hint}
      onBack={onBack}
      cta={{
        label: allChecked ? confirmedLabel : "Vérifier mes vols",
        disabled: !allComplete || hasMissingFlight || isChecking || isSubmitting,
        busy: isChecking || isSubmitting,
        onClick: allChecked ? continueToOffer : checkAll,
      }}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              {flights.length === 1 ? "Vol direct" : `${flights.length} tronçons`}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              L&apos;arrivée d&apos;un vol devient le départ du suivant.
            </p>
          </div>
          {flights.length < MAX_SEGMENTS && (
            <button
              type="button"
              onClick={() =>
                setFlights((current) => [
                  ...current,
                  emptyFlight(
                    `flight-${current.length + 1}`,
                    current.at(-1)?.destination ?? null,
                  ),
                ])
              }
              disabled={!flights.at(-1)?.destination}
              className="rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/15 disabled:cursor-not-allowed disabled:opacity-40"
            >
              + Ajouter une correspondance
            </button>
          )}
        </div>

        {flights.map((flight, index) => (
          <FlightCard
            key={flight.id}
            flight={flight}
            index={index}
            canRemove={index === flights.length - 1 && flights.length > 1}
            onChange={(update) => updateFlight(flight.id, update)}
            onCheck={() => checkFlight(flight)}
            onRemove={() => setFlights((current) => current.slice(0, -1))}
          />
        ))}

        <p className="text-sm leading-relaxed text-muted-foreground">
          Nous récupérons les horaires officiels. Si une compagnie ne répond pas,
          l&apos;équipe Zoumani reprend simplement la vérification à la main.
        </p>
        {failure && (
          <p className="text-sm text-warning" role="status">
            {failure}
          </p>
        )}
      </div>
    </WizardShell>
  );
}

interface FlightCardProps {
  flight: FlightDraft;
  index: number;
  canRemove: boolean;
  onChange: (update: Partial<FlightDraft>) => void;
  onCheck: () => void;
  onRemove: () => void;
}

function FlightCard({
  flight,
  index,
  canRemove,
  onChange,
  onCheck,
  onRemove,
}: FlightCardProps) {
  const sameAirport =
    flight.origin !== null && flight.origin.iata === flight.destination?.iata;
  const inPast =
    flight.departureDate !== "" &&
    flight.departureDate < new Date().toISOString().slice(0, 10);

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <header className="flex items-center justify-between border-b border-border bg-muted/45 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-full bg-inverse-surface text-sm font-bold text-primary">
            {index + 1}
          </span>
          <div>
            <p className="text-sm font-semibold">
              {index === 0 ? "Premier vol" : `Après l'escale ${index}`}
            </p>
            {flight.origin && flight.destination && (
              <p className="text-xs text-muted-foreground">
                {flight.origin.iata} → {flight.destination.iata}
              </p>
            )}
          </div>
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Retirer
          </button>
        )}
      </header>

      <div className="space-y-4 p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <AirportField
            label="Départ"
            placeholder="Ville, aéroport ou code"
            value={flight.origin}
            onChange={(origin) => onChange({ origin })}
          />
          <AirportField
            label={index < 2 ? "Arrivée ou escale" : "Arrivée finale"}
            placeholder="Ville, aéroport ou code"
            value={flight.destination}
            onChange={(destination) => onChange({ destination })}
            error={sameAirport ? "Le départ et l'arrivée sont identiques." : undefined}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <AirlineField
            value={flight.airline}
            onChange={(airline) => onChange({ airline, airlineFallback: "" })}
            fallbackCode={flight.airlineFallback}
            onFallbackChange={(airlineFallback) =>
              onChange({ airlineFallback, airline: null })
            }
          />
          <div>
            <label
              className="mb-1.5 block text-sm font-medium"
              htmlFor={`${flight.id}-number`}
            >
              Numéro de vol
            </label>
            <input
              id={`${flight.id}-number`}
              value={flight.flightNumber}
              maxLength={5}
              inputMode="numeric"
              placeholder="946"
              onChange={(event) =>
                onChange({ flightNumber: event.target.value.replace(/\D/g, "") })
              }
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 font-mono"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Date de départ</label>
            <DateField
              ariaLabel={`Date de départ du vol ${index + 1}`}
              value={flight.departureDate}
              minYear={new Date().getFullYear()}
              maxYear={new Date().getFullYear() + 2}
              onChange={(departureDate) => onChange({ departureDate })}
            />
          </div>
        </div>

        {inPast && (
          <p className="text-sm text-error" role="alert">
            Cette date est passée.
          </p>
        )}

        {flight.lookup === null ? (
          <button
            type="button"
            onClick={onCheck}
            disabled={!isComplete(flight) || flight.isChecking}
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold transition hover:border-primary hover:text-primary disabled:opacity-40"
          >
            {flight.isChecking ? "Vérification…" : "Vérifier ce tronçon"}
          </button>
        ) : (
          <FlightVerdict lookup={flight.lookup} />
        )}
      </div>
    </section>
  );
}

function FlightVerdict({ lookup }: { lookup: FlightLookup }) {
  if (lookup.outcome === "confirmed" && lookup.schedule) {
    return (
      <div className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm">
        <p className="font-semibold text-success">
          {lookup.schedule.flightDesignator} confirmé
        </p>
        <p className="mt-1 text-muted-foreground">
          {formatUtc(lookup.schedule.departureAt)} → {formatUtc(lookup.schedule.arrivalAt)}
        </p>
      </div>
    );
  }
  if (lookup.outcome === "not_found") {
    return (
      <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm" role="alert">
        <p className="font-semibold text-error">Vol introuvable</p>
        <p className="mt-1 text-muted-foreground">
          Vérifiez la compagnie, le numéro, la date et le sens du trajet.
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-warning/35 bg-warning/10 px-4 py-3 text-sm">
      <p className="font-semibold">Contrôle humain prévu</p>
      <p className="mt-1 text-muted-foreground">
        La source est indisponible, mais vous pouvez poursuivre normalement.
      </p>
    </div>
  );
}

function airlineCodeOf(flight: FlightDraft): string {
  return (flight.airline?.iata ?? flight.airlineFallback).trim().toUpperCase();
}

function toFlightDraft(choice: FlightChoice, index: number): FlightDraft {
  return {
    id: `flight-${index + 1}`,
    origin: choice.origin,
    destination: choice.destination,
    airline: null,
    airlineFallback: choice.airlineCode,
    flightNumber: choice.flightNumber,
    departureDate: choice.departureDate,
    lookup: choice.lookup,
    isChecking: false,
  };
}

/** Traduit l'itinéraire d'écran vers le contrat unique de l'API. */
export function toSegmentDrafts(flights: FlightChoice[]): SegmentDraft[] {
  let previousArrival: Date | null = null;

  return flights.map((flight, index) => {
    let departureAt = flight.lookup.schedule?.departureAt;
    let arrivalAt = flight.lookup.schedule?.arrivalAt;

    if (!departureAt || !arrivalAt) {
      let provisionalDeparture = new Date(`${flight.departureDate}T12:00:00Z`);
      if (previousArrival && provisionalDeparture <= previousArrival) {
        provisionalDeparture = new Date(previousArrival.getTime() + 2 * 60 * 60 * 1000);
      }
      departureAt = provisionalDeparture.toISOString();
      arrivalAt = new Date(provisionalDeparture.getTime() + 4 * 60 * 60 * 1000).toISOString();
    }

    previousArrival = new Date(arrivalAt);
    return {
      segmentOrder: index + 1,
      airlineCode: flight.airlineCode,
      flightNumber: flight.flightNumber,
      originAirportCode: flight.origin.iata,
      destinationAirportCode: flight.destination.iata,
      departureAt,
      arrivalAt,
    };
  });
}

function isComplete(flight: FlightDraft): boolean {
  return (
    flight.origin !== null &&
    flight.destination !== null &&
    flight.origin.iata !== flight.destination.iata &&
    airlineCodeOf(flight).length >= 2 &&
    flight.flightNumber.trim().length > 0 &&
    flight.departureDate !== "" &&
    flight.departureDate >= new Date().toISOString().slice(0, 10)
  );
}

function formatUtc(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(iso));
}
