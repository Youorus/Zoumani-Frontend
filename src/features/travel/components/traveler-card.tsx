"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { formatDistance, type CapacityMatch } from "../types/trip.types";
import { TripRoute } from "./trip-route";

interface TravelerCardProps {
  match: CapacityMatch;
  labels: Record<string, string>;
}

/**
 * Un voyageur trouvé, tel qu'un expéditeur le lit.
 *
 * ═══ L'ordre suit la décision, pas les données ═══
 *
 * Quelqu'un qui parcourt des résultats se demande, dans cet ordre :
 * « est-ce que ça va où je veux ? », « quand ? », « combien de place
 * reste-t-il ? », « à quel prix ? », « qui est-ce ? ». La carte répond
 * dans cet ordre.
 *
 * ═══ Le trajet en villes, pas en codes ═══
 *
 * « CDG → DLA » ne dit rien à personne. « Paris → Douala » se lit, et le
 * code reste dessous pour qui vérifie son billet. Les drapeaux se
 * reconnaissent plus vite qu'un nom quand on balaie une liste.
 *
 * ═══ Le poids est ce qui décide ═══
 *
 * Un expéditeur écarte immédiatement une offre trop petite. Il est donc
 * affiché en grand, avec son unité — pas noyé dans une ligne de texte.
 */
export function TravelerCard({ match, labels }: TravelerCardProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-background transition-shadow hover:shadow-[0_18px_50px_-28px_rgb(13_6_2_/_0.45)]">
      {/* ── Le trajet, en bandeau ── */}
      <div className="border-b border-border bg-muted/40 px-4 py-3 sm:px-5">
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
        />
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          {/* ── Ce qui décide : quand, et combien de place ──
              Les deux au même niveau. Une date lointaine écarte une
              offre aussi sûrement qu'un poids insuffisant, et la
              reléguer en légende obligeait à la chercher. */}
          <div className="flex items-stretch gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Départ
              </p>
              <p className="mt-0.5 font-display text-xl leading-tight text-foreground">
                {formatDay(match.departureAt)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatWeekday(match.departureAt)} · {formatTime(match.departureAt)}
              </p>
            </div>

            <span aria-hidden className="w-px self-stretch bg-border" />

            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Place libre
              </p>
              <p className="mt-0.5 flex items-baseline gap-1">
                <span className="font-display text-xl leading-tight text-foreground">
                  {match.availableWeightKg}
                </span>
                <span className="text-sm font-medium text-foreground">kg</span>
              </p>
            </div>
          </div>

          {/* ── Qui, et à quelle distance ── */}
          <div className="flex items-center gap-2.5">
            <div className="text-right">
              <p className="text-sm font-medium">{match.traveler.displayName}</p>
              <p className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                <ShieldCheck className="size-3.5 text-success" aria-hidden />
                Identité vérifiée
              </p>
            </div>
            <Avatar name={match.traveler.displayName} url={match.traveler.photoUrl} />
          </div>
        </div>

        {match.distanceMeters !== null && (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            à {formatDistance(match.distanceMeters)} de chez vous
          </p>
        )}

        {/* ── Ce qu'il accepte, et à quel prix ── */}
        <ul className="mt-4 space-y-1.5 border-t border-border pt-4">
          {match.offers.map((offer) => (
            <li
              key={offer.categoryCode}
              className="flex items-baseline justify-between gap-4 text-sm"
            >
              <span className="min-w-0 truncate text-muted-foreground">
                {labels[offer.categoryCode] ?? offer.categoryCode}
              </span>
              <span className="shrink-0 font-medium tabular-nums">
                {offer.priceMajor} €
                <span className="font-normal text-muted-foreground">
                  {offer.perPiece ? " / pièce" : " / kg"}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <Link
          href={
            match.distanceMeters !== null
              ? `/envois/nouveau?capacity=${match.capacityId}&distance=${Math.round(match.distanceMeters)}`
              : `/envois/nouveau?capacity=${match.capacityId}`
          }
          className="focus-ring mt-4 inline-flex w-full items-center justify-center rounded-xl border border-primary px-4 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground sm:w-auto sm:px-6"
        >
          Réserver de la place
        </Link>
      </div>
    </article>
  );
}

/**
 * La photo, ou les initiales.
 *
 * Un cercle vide au milieu d'une liste attire l'œil sans rien apprendre.
 * Les initiales occupent la place utilement, et ne disent rien de plus
 * que le nom déjà affiché.
 */
function Avatar({ name, url }: { name: string; url: string | null }) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        className="size-11 shrink-0 rounded-full object-cover"
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
      className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary"
    >
      {initiales}
    </span>
  );
}

/** « 20 août » — le jour, court, lisible d'un coup d'œil. */
function formatDay(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(iso));
}

/** Le jour de la semaine : il situe la date sans calcul mental. */
function formatWeekday(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    timeZone: "UTC",
  }).format(new Date(iso));
}

/** L'heure de départ, en UTC — celle que la compagnie publie. */
function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(iso));
}
