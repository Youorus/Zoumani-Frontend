"use client";

import Link from "next/link";
import type { Route } from "next";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Handshake,
  MapPin,
  PackageCheck,
  Sparkles,
  Store,
  Weight,
} from "lucide-react";

import { formatDistance, type CapacityMatch } from "../types/trip.types";
import { TripRoute } from "./trip-route";

interface TravelerCardProps {
  match: CapacityMatch;
  labels: Record<string, string>;
}

/** Une offre lisible comme une promesse de voyage, pas comme une fiche technique. */
export function TravelerCard({ match, labels }: TravelerCardProps) {
  const href = (
    match.distanceMeters !== null
      ? `/envois/nouveau?capacity=${match.capacityId}&distance=${Math.round(match.distanceMeters)}`
      : `/envois/nouveau?capacity=${match.capacityId}`
  ) as Route;

  return (
    <article className="group relative overflow-hidden rounded-[1.75rem] border border-border bg-surface shadow-[0_24px_65px_-48px_rgb(43_29_23_/_0.75)] transition duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_30px_75px_-45px_rgb(255_107_0_/_0.38)]">
      <div className="absolute inset-y-0 left-0 w-1 bg-primary" aria-hidden />

      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={match.traveler.displayName} url={match.traveler.photoUrl} />
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-foreground">
              {match.traveler.displayName}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-success">
              <BadgeCheck className="size-3.5" aria-hidden />
              Voyage contrôlé par Zoumani
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
          <Sparkles className="size-3.5" aria-hidden />
          {match.traveler.rewardPoints > 0
            ? `${match.traveler.rewardPoints.toLocaleString("fr-FR")} points Zoumani`
            : "Nouveau sur Zoumani"}
        </span>
      </div>

      <div className="relative overflow-hidden bg-inverse-surface px-5 py-6 text-inverse-foreground sm:px-7">
        <span
          className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full border-[2.75rem] border-primary/10"
          aria-hidden
        />
        <div className="relative [&_.text-foreground]:!text-inverse-foreground [&_.text-muted-foreground]:!text-inverse-muted-foreground [&_.bg-border]:!bg-white/20">
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
      </div>

      <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_15.5rem]">
        <div>
          <dl className="grid gap-3 sm:grid-cols-3">
            <Fact icon={CalendarDays} label="Départ" value={formatDeparture(match.departureAt)} />
            <Fact icon={Weight} label="Place libre" value={`${match.availableWeightKg} kg`} strong />
            <Fact
              icon={match.acceptsPickup ? Store : Handshake}
              label="Remise du colis"
              value={match.acceptsPickup ? "Relais partenaire possible" : "En main propre"}
            />
          </dl>

          <div className="mt-5 border-t border-border pt-5">
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-sm font-bold">
                <PackageCheck className="size-4 text-primary" aria-hidden />
                Ce que ce voyageur accepte
              </p>
              <span className="text-xs text-muted-foreground">Tarifs du voyageur</span>
            </div>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {match.offers.map((offer) => (
                <li
                  key={offer.categoryCode}
                  className="flex items-center justify-between gap-3 rounded-xl bg-muted/45 px-3.5 py-3 text-sm"
                >
                  <span className="min-w-0 truncate font-medium">
                    {labels[offer.categoryCode] ?? offer.categoryCode}
                  </span>
                  <span className="shrink-0 font-bold text-primary tabular-nums">
                    {formatPrice(offer.priceMajor, match.currency)}
                    <span className="ml-1 text-[0.68rem] font-medium text-muted-foreground">
                      / {offer.perPiece ? "pièce" : "kg"}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="flex flex-col rounded-2xl bg-primary/8 p-4 ring-1 ring-inset ring-primary/12">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
            Votre prochain geste
          </p>
          <p className="mt-2 text-xl font-semibold text-foreground">
            Confier le colis à {firstName(match.traveler.displayName)}
          </p>

          {match.distanceMeters !== null ? (
            <p className="mt-3 flex items-center gap-2 text-xs leading-relaxed text-muted-foreground">
              <MapPin className="size-4 shrink-0 text-primary" aria-hidden />
              À {formatDistance(match.distanceMeters)} de votre adresse vérifiée
            </p>
          ) : (
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Votre adresse reste privée. La remise précise sera organisée dans votre
              espace sécurisé.
            </p>
          )}

          <Link
            href={href}
            className="focus-ring mt-5 inline-flex min-h-12 items-center justify-between gap-3 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-soft transition-transform group-hover:translate-x-0.5 lg:mt-auto"
          >
            Choisir ce voyageur
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </aside>
      </div>
    </article>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
  strong = false,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-background p-3.5">
      <dt className="flex items-center gap-1.5 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">
        <Icon className="size-3.5 text-primary" aria-hidden /> {label}
      </dt>
      <dd className={`mt-2 leading-tight ${strong ? "text-xl font-semibold" : "text-sm font-semibold"}`}>
        {value}
      </dd>
    </div>
  );
}

function Avatar({ name, url }: { name: string; url: string | null }) {
  if (url) {
    return (
      // L'URL signée peut venir de plusieurs stockages ; son domaine n'est pas stable.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        className="size-12 shrink-0 rounded-full object-cover ring-2 ring-primary/20 ring-offset-2 ring-offset-surface"
        loading="lazy"
      />
    );
  }

  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <span
      aria-hidden
      className="grid size-12 shrink-0 place-items-center rounded-full bg-inverse-surface text-sm font-black text-primary ring-2 ring-primary/20 ring-offset-2 ring-offset-surface"
    >
      {initials}
    </span>
  );
}

function formatDeparture(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(iso));
}

function formatPrice(value: string, currency: string): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function firstName(displayName: string): string {
  return displayName.split(" ")[0] || "ce voyageur";
}
