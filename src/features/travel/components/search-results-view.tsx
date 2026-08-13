"use client";

import Link from "next/link";
import { SearchX } from "lucide-react";

import type { CapacityMatch } from "../types/trip.types";
import { TravelerCard } from "./traveler-card";

interface SearchResultsViewProps {
  matches: CapacityMatch[];
  criteria: { origin: string; destination: string; categories: string[] };
  /** Libellés des catégories, résolus côté serveur. */
  labels: Record<string, string>;
}

/**
 * Les voyageurs qui desservent le trajet demandé.
 *
 * Le compte est annoncé en tête : savoir qu'il y a « 3 voyageurs »
 * avant de faire défiler change la façon dont on lit la liste. Et quand
 * il n'y en a aucun, l'écran propose quelque chose plutôt que de
 * constater un vide.
 */
export function SearchResultsView({ matches, criteria, labels }: SearchResultsViewProps) {
  const trajet =
    matches[0] !== undefined
      ? `${matches[0].originCity} → ${matches[0].destinationCity}`
      : `${criteria.origin} → ${criteria.destination}`;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6">
      <header className="mb-5">
        <h1 className="font-display text-2xl text-foreground sm:text-3xl">
          {matches.length === 0
            ? "Aucun voyageur pour l'instant"
            : `${matches.length} voyageur${matches.length > 1 ? "s" : ""} vers ${matches[0].destinationCity}`}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {matches.length === 0
            ? `Sur ${trajet}`
            : "Classés du plus proche de chez vous au plus éloigné."}
        </p>
      </header>

      {matches.length === 0 ? (
        <AucunResultat />
      ) : (
        <ul className="space-y-4">
          {matches.map((match) => (
            <li key={match.capacityId}>
              <TravelerCard match={match} labels={labels} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AucunResultat() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center sm:p-12">
      <span
        aria-hidden
        className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10"
      >
        <SearchX className="size-6 text-primary" />
      </span>
      <p className="mt-4 font-display text-lg text-foreground">
        Personne ne part sur ce trajet
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Les voyageurs publient souvent quelques semaines avant leur vol. Essayez une autre
        ville de départ, ou élargissez les types de colis.
      </p>
      {/* Une issue plutôt qu'un constat : quelqu'un qui ne trouve pas
          personne peut devenir le voyageur qui manquait. */}
      <Link
        href="/trips/nouveau"
        className="focus-ring mt-5 inline-flex items-center justify-center rounded-xl border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
      >
        Vous voyagez bientôt ? Proposez votre place
      </Link>
    </div>
  );
}
