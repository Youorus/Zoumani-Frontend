"use client";

import { useState } from "react";

import { DateField } from "@/components/ui/date-field";

import { lookupFlight } from "../api/travel-client";
import type { Airport, FlightLookup } from "../types/travel.types";
import { AirportField } from "./airport-field";

interface FlightStepProps {
  onConfirmed: (input: {
    origin: Airport;
    destination: Airport;
    airlineCode: string;
    flightNumber: string;
    departureDate: string;
    lookup: FlightLookup;
  }) => void;
}

/**
 * La saisie du vol, et sa confrontation au programme de la compagnie.
 *
 * ═══ L'heure de départ n'est pas demandée ═══
 *
 * C'est le choix structurant de cet écran. Le voyageur annonce sa
 * compagnie, son numéro et sa date ; l'heure exacte est **lue chez la
 * compagnie**. Une classe entière d'erreurs disparaît — heure locale
 * prise pour de l'UTC, minutes inversées, fuseau du téléphone — et le
 * délai de remise se calculera sur une donnée officielle plutôt que sur
 * une déclaration.
 *
 * ═══ Trois réponses, pas deux ═══
 *
 * « Nous n'avons pas pu vérifier » n'est pas « ce vol n'existe pas ».
 * Les confondre ferait accuser d'invention un voyageur honnête un jour
 * de panne. La troisième réponse laisse donc continuer, en annonçant que
 * le dossier passera par un examen humain.
 */
export function FlightStep({ onConfirmed }: FlightStepProps) {
  const [origin, setOrigin] = useState<Airport | null>(null);
  const [destination, setDestination] = useState<Airport | null>(null);
  const [airlineCode, setAirlineCode] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [lookup, setLookup] = useState<FlightLookup | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const complet =
    origin !== null &&
    destination !== null &&
    airlineCode.trim().length >= 2 &&
    flightNumber.trim().length >= 1 &&
    departureDate !== "";

  const memeAeroport = origin !== null && origin.iata === destination?.iata;

  async function verifier() {
    if (!complet || !origin || !destination) {
      return;
    }
    setIsChecking(true);
    setFailure(null);
    try {
      const resultat = await lookupFlight({
        airlineCode: airlineCode.trim().toUpperCase(),
        flightNumber: flightNumber.trim(),
        departureDate,
        origin: origin.iata,
        destination: destination.iata,
      });
      setLookup(resultat);
    } catch {
      // Une panne du relais ne doit pas bloquer : on la traite comme une
      // indisponibilité, ce qu'elle est.
      setFailure("La vérification n'a pas pu aboutir. Vous pouvez continuer.");
      setLookup({ outcome: "unavailable", schedule: null });
    } finally {
      setIsChecking(false);
    }
  }

  const peutContinuer = lookup !== null && lookup.outcome !== "not_found";

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <AirportField
          label="Aéroport de départ"
          placeholder="Ville, aéroport ou code (CDG)"
          value={origin}
          onChange={(airport) => {
            setOrigin(airport);
            setLookup(null);
          }}
        />
        <AirportField
          label="Aéroport d'arrivée"
          placeholder="Ville, aéroport ou code (DLA)"
          value={destination}
          onChange={(airport) => {
            setDestination(airport);
            setLookup(null);
          }}
          error={memeAeroport ? "Le départ et l'arrivée sont identiques." : undefined}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="airline">
            Compagnie
          </label>
          <input
            id="airline"
            value={airlineCode}
            maxLength={3}
            placeholder="AF"
            onChange={(event) => {
              setAirlineCode(event.target.value.toUpperCase());
              setLookup(null);
            }}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 font-mono uppercase"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="flight">
            Numéro de vol
          </label>
          <input
            id="flight"
            value={flightNumber}
            maxLength={5}
            inputMode="numeric"
            placeholder="946"
            onChange={(event) => {
              setFlightNumber(event.target.value.replace(/\D/g, ""));
              setLookup(null);
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
            onChange={(valeur) => {
              setDepartureDate(valeur);
              setLookup(null);
            }}
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Nous récupérons l&apos;horaire exact auprès de la compagnie : vous n&apos;avez pas
        à le saisir.
      </p>

      <button
        type="button"
        onClick={verifier}
        disabled={!complet || memeAeroport || isChecking}
        className="w-full rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground disabled:opacity-50"
      >
        {isChecking ? "Vérification…" : "Vérifier mon vol"}
      </button>

      {lookup?.outcome === "confirmed" && lookup.schedule && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4">
          <p className="font-medium">Vol {lookup.schedule.flightDesignator} confirmé</p>
          <dl className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Départ</dt>
              <dd>{formatUtc(lookup.schedule.departureAt)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Arrivée</dt>
              <dd>{formatUtc(lookup.schedule.arrivalAt)}</dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-muted-foreground">
            Horaires publiés par la compagnie, en heure UTC.
          </p>
        </div>
      )}

      {lookup?.outcome === "not_found" && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
          <p className="font-medium">Ce vol n&apos;a pas été trouvé.</p>
          <p className="mt-1 text-muted-foreground">
            Vérifiez la compagnie, le numéro et le sens du trajet. Un vol aller et son
            retour portent des numéros différents.
          </p>
        </div>
      )}

      {lookup?.outcome === "unavailable" && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          <p className="font-medium">Nous n&apos;avons pas pu vérifier ce vol.</p>
          <p className="mt-1 text-muted-foreground">
            Ce n&apos;est pas un refus : votre voyage sera examiné par une personne de
            notre équipe. Vous pouvez continuer.
          </p>
          {failure && <p className="mt-1 text-muted-foreground">{failure}</p>}
        </div>
      )}

      <button
        type="button"
        disabled={!peutContinuer || !origin || !destination}
        onClick={() => {
          if (!origin || !destination || !lookup) {
            return;
          }
          onConfirmed({
            origin,
            destination,
            airlineCode: airlineCode.trim().toUpperCase(),
            flightNumber: flightNumber.trim(),
            departureDate,
            lookup,
          });
        }}
        className="w-full rounded-lg border border-border px-4 py-2.5 font-medium disabled:opacity-50"
      >
        Continuer
      </button>
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
