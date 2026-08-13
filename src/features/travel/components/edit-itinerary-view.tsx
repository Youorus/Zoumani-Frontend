"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { DateField } from "@/components/ui/date-field";

import { findAirportByCode, lookupFlight, updateItinerary } from "../api/travel-client";
import type { Airline, Airport, FlightLookup } from "../types/travel.types";
import type { Trip } from "../types/trip.types";
import { AirlineField } from "./airline-field";
import { AirportField } from "./airport-field";

interface EditItineraryViewProps {
  trip: Trip;
}

/**
 * La correction d'un itinéraire déjà déclaré.
 *
 * ═══ Le vol est revérifié, toujours ═══
 *
 * Changer une date ou un numéro sans reconsulter la compagnie
 * laisserait l'ancien horaire en base : le voyage afficherait un départ
 * qui n'a plus lieu, et le délai de remise opposable à un expéditeur
 * serait faux. La confirmation est donc exigée avant l'enregistrement,
 * exactement comme à la création.
 *
 * ═══ Pourquoi l'écran n'est pas le formulaire de création ═══
 *
 * Créer, c'est répondre à des questions dans l'ordre ; corriger, c'est
 * retrouver ce qu'on a écrit et changer une chose. Un assistant en cinq
 * étapes pour modifier une date ferait retraverser quatre écrans déjà
 * remplis. Tout est donc sur un seul écran, pré-rempli.
 *
 * ═══ Vol direct seulement ═══
 *
 * L'API accepte jusqu'à six segments ; cet écran n'en modifie qu'un. Un
 * itinéraire à escales déclaré autrement reste intact — la vue prévient
 * plutôt que d'écraser ce qu'elle ne sait pas éditer.
 */
export function EditItineraryView({ trip }: EditItineraryViewProps) {
  const router = useRouter();
  const segment = trip.segments[0];

  const [origin, setOrigin] = useState<Airport | null>(null);
  const [destination, setDestination] = useState<Airport | null>(null);
  const [airline, setAirline] = useState<Airline | null>(null);
  const [airlineFallback, setAirlineFallback] = useState(segment?.airlineCode ?? "");
  const [flightNumber, setFlightNumber] = useState(segment?.flightNumber ?? "");
  const [departureDate, setDepartureDate] = useState(
    segment?.departureAt.slice(0, 10) ?? "",
  );
  const [lookup, setLookup] = useState<FlightLookup | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  // Les aéroports arrivent en codes ; on les résout pour afficher la
  // ville. Sans cela, l'écran de correction serait moins lisible que
  // celui de création — on ne verrait que « CDG ».
  useEffect(() => {
    let vivant = true;
    if (!segment) {
      return;
    }
    void Promise.all([
      findAirportByCode(segment.originAirportCode),
      findAirportByCode(segment.destinationAirportCode),
    ]).then(([depart, arrivee]) => {
      if (!vivant) {
        return;
      }
      setOrigin(depart);
      setDestination(arrivee);
    });
    return () => {
      vivant = false;
    };
  }, [segment]);

  if (!trip.isEditable) {
    return <NonModifiable />;
  }
  if (trip.segments.length > 1) {
    return <TropDeSegments />;
  }

  const codeCompagnie = (airline?.iata ?? airlineFallback).trim().toUpperCase();
  const dansLePasse =
    departureDate !== "" && departureDate < new Date().toISOString().slice(0, 10);
  const complet =
    origin !== null &&
    destination !== null &&
    codeCompagnie.length >= 2 &&
    flightNumber.trim().length >= 1 &&
    departureDate !== "" &&
    !dansLePasse &&
    origin.iata !== destination.iata;

  async function verifier() {
    if (!complet || !origin || !destination) {
      return;
    }
    setIsChecking(true);
    setFailure(null);
    try {
      setLookup(
        await lookupFlight({
          airlineCode: codeCompagnie,
          flightNumber: flightNumber.trim(),
          departureDate,
          origin: origin.iata,
          destination: destination.iata,
        }),
      );
    } catch {
      setLookup({ outcome: "unavailable", schedule: null });
    } finally {
      setIsChecking(false);
    }
  }

  async function enregistrer() {
    if (!lookup || !origin || !destination) {
      return;
    }
    setIsSaving(true);
    setFailure(null);
    try {
      await updateItinerary(trip.id, [
        {
          segmentOrder: 1,
          airlineCode: codeCompagnie,
          flightNumber: flightNumber.trim(),
          originAirportCode: origin.iata,
          destinationAirportCode: destination.iata,
          departureAt: lookup.schedule?.departureAt ?? `${departureDate}T12:00:00Z`,
          arrivalAt: lookup.schedule?.arrivalAt ?? `${departureDate}T18:00:00Z`,
        },
      ]);
      router.push("/compte/trajets");
      router.refresh();
    } catch (error) {
      setFailure(
        error instanceof Error ? error.message : "L'enregistrement n'a pas abouti.",
      );
      setIsSaving(false);
    }
  }

  function invalider() {
    // Toute modification périme la confirmation précédente : garder
    // l'ancien verdict laisserait enregistrer un horaire qui ne
    // correspond plus au vol saisi.
    setLookup(null);
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-5 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Modifier mon vol</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Nous reconfirmons le vol auprès de la compagnie avant d&apos;enregistrer.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <AirportField
          label="Aéroport de départ"
          placeholder="Ville, aéroport ou code"
          value={origin}
          onChange={(airport) => {
            setOrigin(airport);
            invalider();
          }}
        />
        <AirportField
          label="Aéroport d'arrivée"
          placeholder="Ville, aéroport ou code"
          value={destination}
          onChange={(airport) => {
            setDestination(airport);
            invalider();
          }}
          error={
            origin && origin.iata === destination?.iata
              ? "Le départ et l'arrivée sont identiques."
              : undefined
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <AirlineField
          value={airline}
          onChange={(choisie) => {
            setAirline(choisie);
            invalider();
          }}
          fallbackCode={airlineFallback}
          onFallbackChange={(code) => {
            setAirlineFallback(code);
            setAirline(null);
            invalider();
          }}
        />
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="flight">
            Numéro de vol
          </label>
          <input
            id="flight"
            value={flightNumber}
            maxLength={5}
            inputMode="numeric"
            onChange={(event) => {
              setFlightNumber(event.target.value.replace(/\D/g, ""));
              invalider();
            }}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 font-mono"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="departure-date">
            Date de départ
          </label>
          <DateField
            ariaLabel="Date de départ"
            value={departureDate}
            minYear={new Date().getFullYear()}
            maxYear={new Date().getFullYear() + 2}
            onChange={(valeur) => {
              setDepartureDate(valeur);
              invalider();
            }}
          />
        </div>
      </div>

      {dansLePasse && (
        <p className="text-sm text-error" role="alert">
          Cette date est passée. Choisissez la date de votre prochain vol.
        </p>
      )}

      {lookup === null ? (
        <button
          type="button"
          onClick={verifier}
          disabled={!complet || isChecking}
          className="w-full rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground disabled:opacity-40"
        >
          {isChecking ? "Vérification…" : "Vérifier ce vol"}
        </button>
      ) : (
        <>
          <Verdict lookup={lookup} />
          <button
            type="button"
            onClick={enregistrer}
            disabled={lookup.outcome === "not_found" || isSaving}
            className="w-full rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground disabled:opacity-40"
          >
            {isSaving ? "Enregistrement…" : "Enregistrer les modifications"}
          </button>
        </>
      )}

      {failure && (
        <p className="text-sm text-error" role="alert">
          {failure}
        </p>
      )}
    </div>
  );
}

function Verdict({ lookup }: { lookup: FlightLookup }) {
  if (lookup.outcome === "confirmed" && lookup.schedule) {
    return (
      <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm">
        <p className="font-medium">Vol {lookup.schedule.flightDesignator} confirmé</p>
        <p className="mt-1 text-muted-foreground">
          Départ {formatUtc(lookup.schedule.departureAt)} (UTC)
        </p>
      </div>
    );
  }
  if (lookup.outcome === "not_found") {
    return (
      <div
        className="rounded-xl border border-error/40 bg-error/10 p-4 text-sm"
        role="alert"
      >
        <p className="font-medium">Ce vol n&apos;a pas été trouvé.</p>
        <p className="mt-1 text-muted-foreground">
          Vérifiez la compagnie, le numéro et le sens du trajet.
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
      <p className="font-medium">Nous n&apos;avons pas pu vérifier ce vol.</p>
      <p className="mt-1 text-muted-foreground">
        Ce n&apos;est pas un refus : votre voyage repartira en examen. Vous pouvez
        enregistrer.
      </p>
    </div>
  );
}

function NonModifiable() {
  return (
    <div className="mx-auto w-full max-w-lg space-y-3 p-6 text-center">
      <h1 className="text-xl font-semibold">Ce voyage n&apos;est plus modifiable</h1>
      <p className="text-sm text-muted-foreground">
        Son dossier est en cours d&apos;examen ou déjà tranché. Pour changer de vol,
        annulez ce voyage et déclarez-en un nouveau.
      </p>
    </div>
  );
}

function TropDeSegments() {
  return (
    <div className="mx-auto w-full max-w-lg space-y-3 p-6 text-center">
      <h1 className="text-xl font-semibold">Itinéraire à escales</h1>
      <p className="text-sm text-muted-foreground">
        Cet écran ne modifie qu&apos;un vol direct. Pour corriger un itinéraire à escales,
        annulez ce voyage et déclarez-le à nouveau — nous préférons vous le dire plutôt
        que d&apos;écraser vos correspondances.
      </p>
    </div>
  );
}

/** Affiche un instant UTC sans le convertir : c'est l'heure officielle. */
function formatUtc(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(iso));
}
