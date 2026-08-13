"use client";

import { ShieldCheck } from "lucide-react";

import { formatDistance, type CapacityMatch } from "../types/trip.types";
import { TripRoute } from "./trip-route";

interface TripSummaryBannerProps {
  match: CapacityMatch;
}

/**
 * Le voyage choisi, rappelé à chaque étape de la déclaration.
 *
 * ═══ Pourquoi il ne disparaît jamais ═══
 *
 * Un expéditeur qui saisit des quantités, photographie, puis choisit une
 * remise, traverse trois écrans. S'il perd de vue **avec qui** et **vers
 * où** il envoie, il doit revenir en arrière pour vérifier — et perd sa
 * saisie ou sa confiance. Le rappel coûte quelques lignes ; l'absence
 * coûte un abandon.
 *
 * Il porte le strict nécessaire : le trajet, la date, le voyageur, la
 * place. Y ajouter les tarifs le transformerait en second récapitulatif,
 * concurrent de celui qui compte — le total, en bas de l'écran.
 */
export function TripSummaryBanner({ match }: TripSummaryBannerProps) {
  return (
    <section
      aria-label="Voyage choisi"
      className="rounded-2xl border border-border bg-muted/40 p-3.5"
    >
      <div className="flex items-center gap-3">
        <Avatar name={match.traveler.displayName} url={match.traveler.photoUrl} />

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-sm font-medium">
            <span className="truncate">{match.traveler.displayName}</span>
            <ShieldCheck className="size-3.5 shrink-0 text-success" aria-hidden />
          </p>
          <span className="flex flex-wrap items-center gap-x-1.5">
            <TripRoute
              origin={{
                code: match.origin,
                city: match.originCity,
                country: match.originCountry,
              }}
              destination={{
                code: match.destination,
                city: match.destinationCity,
                country: match.destinationCountry,
              }}
              size="compact"
            />
            <span aria-hidden className="text-xs text-muted-foreground">
              ·
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDay(match.departureAt)}
            </span>
          </span>
        </div>

        <div className="shrink-0 text-right">
          <p className="font-display text-lg leading-none text-foreground">
            {match.availableWeightKg}
            <span className="ml-0.5 text-xs font-medium">kg</span>
          </p>
          {match.distanceMeters !== null && (
            <p className="mt-0.5 text-xs text-primary">
              à {formatDistance(match.distanceMeters)}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function Avatar({ name, url }: { name: string; url: string | null }) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt="" className="size-10 shrink-0 rounded-full object-cover" />
    );
  }
  const initiales = name
    .split(" ")
    .map((mot) => mot[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span
      aria-hidden
      className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary"
    >
      {initiales}
    </span>
  );
}

/** « 20 août » — court, lisible d'un coup d'œil. */
function formatDay(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(iso));
}
