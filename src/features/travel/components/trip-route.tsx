"use client";

import { Plane } from "lucide-react";

import { flagOf } from "../types/trip.types";

interface TripRouteProps {
  origin: { code: string; city?: string; country?: string };
  destination: { code: string; city?: string; country?: string };
  /** `full` sur une carte, `compact` dans une liste ou un bandeau. */
  size?: "full" | "compact";
}

/**
 * Un trajet, affiché de la même façon partout.
 *
 * ═══ Pourquoi un composant et non trois écritures ═══
 *
 * Le trajet apparaît sur la carte de résultat, dans la liste des
 * trajets, sur le détail d'un voyage et dans le bandeau de déclaration.
 * Écrit quatre fois, il divergeait déjà : deux écrans montraient les
 * villes, deux autres des codes à trois lettres que personne ne
 * reconnaît.
 *
 * La ville quand on la connaît, le code toujours en dessous — c'est lui
 * qui figure sur un billet. Le drapeau se reconnaît plus vite qu'un nom
 * quand on balaie une liste.
 */
export function TripRoute({ origin, destination, size = "full" }: TripRouteProps) {
  if (size === "compact") {
    return (
      <span className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
        {origin.country && <span aria-hidden>{flagOf(origin.country)}</span>}
        <span>{origin.city || origin.code}</span>
        <Plane className="size-3 rotate-90 text-primary" aria-hidden />
        {destination.country && <span aria-hidden>{flagOf(destination.country)}</span>}
        <span>{destination.city || destination.code}</span>
      </span>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Ville {...origin} />
      <span className="flex flex-1 items-center gap-1.5" aria-hidden>
        <span className="h-px flex-1 bg-border" />
        <Plane className="size-4 rotate-90 text-primary" />
        <span className="h-px flex-1 bg-border" />
      </span>
      <Ville {...destination} alignRight />
    </div>
  );
}

function Ville({
  code,
  city,
  country,
  alignRight = false,
}: {
  code: string;
  city?: string;
  country?: string;
  alignRight?: boolean;
}) {
  return (
    <span className={alignRight ? "text-right" : ""}>
      <span
        className="flex items-center gap-1.5"
        style={alignRight ? { flexDirection: "row-reverse" } : undefined}
      >
        {country && (
          <span aria-hidden className="text-base leading-none">
            {flagOf(country)}
          </span>
        )}
        <span className="font-display text-lg leading-tight text-foreground">
          {city || code}
        </span>
      </span>
      {/* Le code reste lisible : c'est lui qui figure sur un billet. */}
      <span className="block font-mono text-xs text-muted-foreground">{code}</span>
    </span>
  );
}
