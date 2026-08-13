"use client";

import Link from "next/link";

import { formatDistance, type CapacityMatch } from "../types/trip.types";

interface SearchResultsViewProps {
  matches: CapacityMatch[];
  criteria: { origin: string; destination: string; categories: string[] };
  /** Libellés des catégories, résolus côté serveur. */
  labels: Record<string, string>;
}

/**
 * Les voyageurs qui desservent le trajet demandé.
 *
 * ═══ La distance d'abord ═══
 *
 * C'est l'information qui décide. « À 6 km » et « à 400 km » ne
 * conduisent pas à la même réservation : l'une se règle en une
 * rencontre, l'autre suppose un transporteur. Elle est donc mise en
 * avant, et non reléguée en petits caractères.
 *
 * Elle manque souvent — le géocodage échoue sur les adresses décrites
 * par des repères, et un visiteur non connecté n'a pas d'adresse. La
 * carte reste alors complète et lisible : une absence de distance n'est
 * pas un défaut d'affichage.
 *
 * ═══ Le voyageur n'est pas identifié ═══
 *
 * « Aïcha D. » — le serveur ne rend rien de plus. Tant qu'aucune
 * transaction ne lie les deux personnes, le nom complet n'apporte rien à
 * l'expéditeur et expose le voyageur.
 */
export function SearchResultsView({ matches, criteria, labels }: SearchResultsViewProps) {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 p-4 sm:p-6">
      <p className="text-sm text-muted-foreground">
        {matches.length === 0
          ? "Aucun voyageur sur ce trajet pour le moment."
          : `${matches.length} voyageur${matches.length > 1 ? "s" : ""} sur ${criteria.origin} → ${criteria.destination}`}
      </p>

      {matches.length === 0 ? (
        <AucunResultat />
      ) : (
        <ul className="space-y-3">
          {matches.map((match) => (
            <li key={match.capacityId}>
              <CarteVoyageur match={match} labels={labels} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CarteVoyageur({
  match,
  labels,
}: {
  match: CapacityMatch;
  labels: Record<string, string>;
}) {
  return (
    <article className="rounded-2xl border border-border p-4 transition-colors hover:border-foreground/20">
      <div className="flex items-start gap-3">
        <Avatar name={match.traveler.displayName} url={match.traveler.photoUrl} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-medium">{match.traveler.displayName}</p>
            {match.distanceMeters !== null && (
              <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                à {formatDistance(match.distanceMeters)} de chez vous
              </span>
            )}
          </div>

          <p className="mt-0.5 text-sm text-muted-foreground">
            {formatUtc(match.departureAt)} · {match.origin} → {match.destination}
          </p>

          <p className="mt-2 text-sm">
            <span className="font-medium">{match.availableWeightKg} kg</span>
            <span className="text-muted-foreground"> disponibles</span>
          </p>

          <ul className="mt-2.5 flex flex-wrap gap-1.5">
            {match.offers.map((offer) => (
              <li
                key={offer.categoryCode}
                className="rounded-full border border-border px-2.5 py-1 text-xs"
              >
                {labels[offer.categoryCode] ?? offer.categoryCode}
                <span className="ml-1.5 font-medium">
                  {offer.priceMajor} €{offer.perPiece ? "/pièce" : "/kg"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Link
        href={
          // La distance voyage dans l'URL : elle vient d'être calculée
          // par la recherche, et la recalculer à l'écran suivant
          // supposerait de connaître la position du voyageur — que
          // l'API ne rend jamais.
          match.distanceMeters !== null
            ? `/envois/nouveau?capacity=${match.capacityId}&distance=${Math.round(match.distanceMeters)}`
            : `/envois/nouveau?capacity=${match.capacityId}`
        }
        className="mt-3 block w-full rounded-xl bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground"
      >
        Envoyer avec ce voyageur
      </Link>
    </article>
  );
}

/**
 * La photo, ou les initiales.
 *
 * Un cercle vide au milieu d'une liste attire l'œil sans rien apprendre.
 * Les initiales occupent la place utilement, et restent cohérentes avec
 * l'anonymat : elles ne disent rien de plus que le nom affiché.
 */
function Avatar({ name, url }: { name: string; url: string | null }) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        className="size-12 shrink-0 rounded-full object-cover"
        loading="lazy"
      />
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
      className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground"
    >
      {initiales}
    </span>
  );
}

function AucunResultat() {
  return (
    <div className="rounded-2xl border border-dashed border-border p-8 text-center">
      <p className="font-medium">Personne ne part sur ce trajet pour l&apos;instant</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Essayez une autre ville de départ, ou élargissez les types de colis. Les voyageurs
        publient souvent quelques semaines avant leur vol.
      </p>
    </div>
  );
}

/** Affiche un instant UTC sans le convertir : c'est l'heure officielle. */
function formatUtc(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(iso));
}
