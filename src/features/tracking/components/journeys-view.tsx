"use client";

import { AlertTriangle, ChevronRight, Package, PackageCheck } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";

import {
  STEP_LABELS,
  isIncident,
  needsLabel,
  type Journey,
} from "../types/tracking.types";

/**
 * Les colis que je suis, aux deux bouts.
 *
 * ═══ Une seule liste, expéditions et transports mêlés ═══
 *
 * Le rôle n'est pas un attribut de la personne mais une position dans une
 * transaction : la même personne expédie lundi et voyage jeudi. Deux
 * listes séparées obligeraient à choisir un onglet avant de savoir où est
 * son colis, et la moitié des gens regarderaient le mauvais.
 *
 * Le sens de chaque ligne est porté par un mot — « J'expédie » ou « Je
 * transporte » — et par l'action, qui vient du serveur.
 *
 * ═══ Ce qui remonte en premier ═══
 *
 * Ceux qui attendent quelque chose de la personne. Un colis à déposer ou à
 * retirer passe avant un colis en transit : c'est la seule ligne sur
 * laquelle elle peut agir.
 */
export function JourneysView({ journeys }: { journeys: Journey[] }) {
  if (journeys.length === 0) {
    return <Empty />;
  }

  const tries = [...journeys].sort(byUrgency);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-6">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">Mes colis</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ceux que vous expédiez et ceux que vous transportez.
        </p>
      </header>

      <ul className="space-y-3">
        {tries.map((journey) => (
          <li key={journey.id}>
            <JourneyRow journey={journey} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Ce qui demande une action passe devant.
 *
 * Un tri par date mettrait en haut le colis le plus récent, qui n'est pas
 * celui sur lequel on peut agir. Ici, la première ligne est toujours
 * celle qui attend quelque chose.
 */
function byUrgency(a: Journey, b: Journey): number {
  return rank(a) - rank(b);
}

function rank(journey: Journey): number {
  if (isIncident(journey.step)) {
    return 0;
  }
  if (journey.step === "awaiting_pickup" && !journey.isSender) {
    return 1;
  }
  if (needsLabel(journey) || journey.step === "awaiting_meeting") {
    return 2;
  }
  if (journey.step === "collected" || journey.step === "handed_over") {
    return 9;
  }
  return 5;
}

function JourneyRow({ journey }: { journey: Journey }) {
  const incident = isIncident(journey.step);
  const termine = journey.step === "collected" || journey.step === "handed_over";

  return (
    <Link
      href={`/compte/envois/suivi/${journey.id}` as Route}
      className={`flex items-center gap-3 rounded-2xl border p-4 transition hover:border-primary/50 ${
        incident ? "border-error/40 bg-error/5" : "border-border bg-card"
      }`}
    >
      <span
        aria-hidden
        className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
          incident
            ? "bg-error/10 text-error"
            : termine
              ? "bg-muted text-muted-foreground"
              : "bg-primary/10 text-primary"
        }`}
      >
        {incident ? (
          <AlertTriangle size={18} />
        ) : termine ? (
          <PackageCheck size={18} />
        ) : (
          <Package size={18} />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-md bg-muted px-1.5 py-0.5 font-medium">
            {journey.isSender ? "J'expédie" : "Je transporte"}
          </span>
          <span className="truncate">{STEP_LABELS[journey.step]}</span>
        </p>
        {/* L'action, pas l'étape : « déposez votre colis » se comprend,
            « awaiting_dropoff » non. */}
        <p className="mt-0.5 truncate text-sm font-medium">{journey.action}</p>
      </div>

      <ChevronRight size={18} className="shrink-0 text-muted-foreground" aria-hidden />
    </Link>
  );
}

function Empty() {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-16 text-center">
      <span
        aria-hidden
        className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground"
      >
        <Package size={24} />
      </span>
      <h1 className="text-lg font-semibold">Aucun colis en cours</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Vos colis apparaîtront ici dès qu&apos;un paiement est confirmé — que vous les
        expédiiez ou que vous les transportiez.
      </p>
      <Link
        href={"/" as Route}
        className="mt-6 inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white"
      >
        Chercher un voyageur
      </Link>
    </div>
  );
}
