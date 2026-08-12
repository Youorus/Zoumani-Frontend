"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { VerificationStage } from "@/features/verification/types/verification.types";

import { declareTrip, offerCapacity } from "../api/travel-client";
import type { Airport, FlightLookup } from "../types/travel.types";
import { CapacityStep, type CapacitySelection } from "./capacity-step";
import { FlightStep } from "./flight-step";

interface CreateTripViewProps {
  /** L'étape du dossier d'identité, lue côté serveur. */
  stage: VerificationStage;
}

interface FlightChoice {
  origin: Airport;
  destination: Airport;
  airlineCode: string;
  flightNumber: string;
  departureDate: string;
  lookup: FlightLookup;
}

/**
 * Le parcours de publication d'un voyage.
 *
 * ═══ Le garde-fou est côté serveur ═══
 *
 * L'écran d'invitation à vérifier son identité n'est **pas** une
 * protection : c'est une courtoisie, qui évite de remplir un formulaire
 * pour se le voir refuser à l'envoi. L'autorisation réelle est
 * l'exigence d'un voyage vérifié, appliquée par l'API. Traiter cet écran
 * comme une sécurité reviendrait à protéger une porte en cachant sa
 * poignée.
 *
 * ═══ Deux étapes, une intention ═══
 *
 * Le vol d'abord, parce qu'il conditionne tout : un vol introuvable ne
 * mérite pas qu'on saisisse dix tarifs. La capacité ensuite.
 */
export function CreateTripView({ stage }: CreateTripViewProps) {
  const router = useRouter();
  const [flight, setFlight] = useState<FlightChoice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  if (stage !== "verifie") {
    return <InvitationAVerifier stage={stage} />;
  }

  async function publier(selection: CapacitySelection) {
    if (!flight) {
      return;
    }
    setIsSubmitting(true);
    setFailure(null);
    try {
      // L'heure vient de la compagnie quand elle est connue. À défaut —
      // vérification indisponible — on retient midi UTC : une heure
      // plausible que l'examen humain corrigera, plutôt qu'un minuit qui
      // ferait basculer la date d'un fuseau à l'autre.
      const depart =
        flight.lookup.schedule?.departureAt ?? `${flight.departureDate}T12:00:00Z`;
      const arrivee =
        flight.lookup.schedule?.arrivalAt ?? `${flight.departureDate}T18:00:00Z`;

      const trip = await declareTrip([
        {
          segmentOrder: 1,
          airlineCode: flight.airlineCode,
          flightNumber: flight.flightNumber,
          originAirportCode: flight.origin.iata,
          destinationAirportCode: flight.destination.iata,
          departureAt: depart,
          arrivalAt: arrivee,
        },
      ]);

      await offerCapacity(trip.id, selection);
      router.push(`/trips/${trip.id}`);
    } catch (error) {
      setFailure(
        error instanceof Error
          ? error.message
          : "L'enregistrement n'a pas abouti. Réessayez.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-semibold">Proposer un voyage</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {flight
            ? "Indiquez ce que vous acceptez de transporter, et à quel tarif."
            : "Commençons par votre vol."}
        </p>
      </header>

      <ol className="flex gap-2 text-sm" aria-label="Étapes">
        <Etape numero={1} libelle="Votre vol" actif={!flight} fait={flight !== null} />
        <Etape numero={2} libelle="Votre capacité" actif={flight !== null} fait={false} />
      </ol>

      {flight === null ? (
        <FlightStep onConfirmed={setFlight} />
      ) : (
        <>
          <button
            type="button"
            onClick={() => setFlight(null)}
            className="text-sm text-muted-foreground underline"
          >
            ← Modifier mon vol
          </button>
          <CapacityStep onSubmit={publier} isSubmitting={isSubmitting} />
        </>
      )}

      {failure && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
          {failure}
        </p>
      )}
    </div>
  );
}

function Etape({
  numero,
  libelle,
  actif,
  fait,
}: {
  numero: number;
  libelle: string;
  actif: boolean;
  fait: boolean;
}) {
  return (
    <li
      className={
        actif || fait
          ? "flex items-center gap-2 font-medium"
          : "flex items-center gap-2 text-muted-foreground"
      }
    >
      <span className="flex size-6 items-center justify-center rounded-full border border-current text-xs">
        {fait ? "✓" : numero}
      </span>
      {libelle}
    </li>
  );
}

/**
 * Ce qu'on montre à qui n'a pas encore d'identité vérifiée.
 *
 * Le message dépend de l'étape : quelqu'un dont le dossier est en cours
 * d'examen n'a rien à faire, et lui proposer de « commencer » serait le
 * renvoyer vers un formulaire qu'il a déjà rempli.
 */
function InvitationAVerifier({ stage }: { stage: VerificationStage }) {
  const messages: Record<VerificationStage, { titre: string; texte: string }> = {
    absent: {
      titre: "Vérifiez votre identité pour proposer un voyage",
      texte:
        "Les expéditeurs confient leurs colis à des personnes dont l'identité est établie. C'est ce qui rend Zoumani sûr, dans les deux sens.",
    },
    en_cours: {
      titre: "Votre dossier est en cours d'examen",
      texte:
        "Vous pourrez proposer un voyage dès qu'il sera validé. Rien à faire de votre côté.",
    },
    a_corriger: {
      titre: "Votre dossier attend une correction",
      texte: "Un détail doit être repris avant que vous puissiez proposer un voyage.",
    },
    refuse: {
      titre: "Votre dossier n'a pas été validé",
      texte: "Reprenez votre vérification d'identité pour proposer un voyage.",
    },
    verifie: { titre: "", texte: "" },
  };
  const message = messages[stage];
  const agir = stage === "en_cours";

  return (
    <div className="mx-auto w-full max-w-lg space-y-4 p-6 text-center">
      <h1 className="text-xl font-semibold">{message.titre}</h1>
      <p className="text-sm text-muted-foreground">{message.texte}</p>
      {!agir && (
        <Link
          href="/compte/identite"
          className="inline-block rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground"
        >
          {stage === "absent" ? "Vérifier mon identité" : "Reprendre ma vérification"}
        </Link>
      )}
    </div>
  );
}
