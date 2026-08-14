"use client";

import {
  Check,
  Clock3,
  ExternalLink,
  MapPin,
  Navigation,
  Search,
  Store,
  X,
} from "lucide-react";
import { useDeferredValue, useId, useState } from "react";

import { cn } from "@/lib/utils/cn";

import { formatDistance, type ServicePoint } from "../types/trip.types";

interface ServicePointSelectorProps {
  points: ServicePoint[];
  selected: ServicePoint | null;
  onSelect: (point: ServicePoint) => void;
}

const ALL_CARRIERS = "all";

/**
 * Sélecteur orienté décision : les données utiles passent avant la carte.
 * La navigation détaillée est déléguée à l'application cartographique de
 * l'utilisateur, qui dispose des rues, du trafic et de l'accessibilité réels.
 */
export function ServicePointSelector({
  points,
  selected,
  onSelect,
}: ServicePointSelectorProps) {
  const searchId = useId();
  const titleId = useId();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [carrier, setCarrier] = useState(ALL_CARRIERS);

  const rankedPoints = [...points].sort(compareServicePoints);
  const carriers = rankedPoints.reduce<Array<{ code: string; label: string }>>(
    (values, point) => {
      if (!values.some((value) => value.code === point.carrier)) {
        values.push({ code: point.carrier, label: point.carrierName });
      }
      return values;
    },
    [],
  );
  const normalizedQuery = normalizeSearch(deferredQuery);
  const visiblePoints = rankedPoints.filter((point) => {
    const matchesCarrier = carrier === ALL_CARRIERS || point.carrier === carrier;
    const searchable = normalizeSearch(
      `${point.name} ${point.street} ${point.postalCode} ${point.city} ${point.carrierName}`,
    );
    return matchesCarrier && (!normalizedQuery || searchable.includes(normalizedQuery));
  });

  if (points.length === 0) {
    return null;
  }

  function resetFilters() {
    setQuery("");
    setCarrier(ALL_CARRIERS);
  }

  return (
    <section
      aria-labelledby={titleId}
      className="overflow-hidden rounded-[1.75rem] border border-primary/15 bg-surface shadow-[0_20px_70px_-45px_rgba(70,35,16,0.5)]"
    >
      <header className="border-b border-border bg-primary/[0.055] px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Dépôt près de chez vous
            </p>
            <h3
              id={titleId}
              className="mt-1 font-display text-2xl leading-tight text-foreground sm:text-3xl"
            >
              Choisissez votre point relais
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {points.length} {points.length > 1 ? "adresses trouvées" : "adresse trouvée"},
              {points.length > 1 ? " classées" : " classée"} de la plus proche à la plus
              éloignée.
            </p>
          </div>

          <div className="relative w-full lg:max-w-xs">
            <label htmlFor={searchId} className="sr-only">
              Rechercher un point relais
            </label>
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-primary"
              aria-hidden
            />
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nom, rue ou ville"
              className="focus-ring h-11 w-full rounded-xl border border-border bg-surface-elevated pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Effacer la recherche"
                className="focus-ring absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" aria-hidden />
              </button>
            )}
          </div>
        </div>

        {carriers.length > 1 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label="Filtrer par transporteur">
            <FilterButton
              active={carrier === ALL_CARRIERS}
              onClick={() => setCarrier(ALL_CARRIERS)}
            >
              Tous
            </FilterButton>
            {carriers.map((candidate) => (
              <FilterButton
                key={candidate.code}
                active={carrier === candidate.code}
                onClick={() => setCarrier(candidate.code)}
              >
                {candidate.label}
              </FilterButton>
            ))}
          </div>
        )}
      </header>

      <div className="grid lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <div className="border-border lg:border-r">
          {visiblePoints.length > 0 ? (
            <ol
              className="max-h-[34rem] space-y-2 overflow-y-auto p-3 sm:p-4"
              aria-label="Points relais disponibles"
              aria-live="polite"
            >
              {visiblePoints.map((candidate) => {
                const rank = rankedPoints.findIndex(
                  (point) => servicePointKey(point) === servicePointKey(candidate),
                );
                const isSelected =
                  selected !== null && servicePointKey(candidate) === servicePointKey(selected);
                const isNearest = rank === 0 && candidate.distanceMeters !== null;

                return (
                  <li key={servicePointKey(candidate)}>
                    <button
                      type="button"
                      onClick={() => onSelect(candidate)}
                      aria-pressed={isSelected}
                      aria-label={`${isSelected ? "Point sélectionné" : "Choisir"} ${candidate.name}`}
                      className={cn(
                        "focus-ring group relative w-full rounded-2xl border p-4 text-left transition-[border-color,background-color,box-shadow,transform] duration-200",
                        isSelected
                          ? "border-primary bg-primary/[0.06] shadow-[0_14px_35px_-28px_rgba(234,82,17,0.9)]"
                          : "border-border bg-surface-elevated hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary/[0.025]",
                      )}
                    >
                      <span
                        className={cn(
                          "absolute right-3 top-3 grid size-7 place-items-center rounded-full border text-xs font-bold transition-colors",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-surface-elevated text-muted-foreground group-hover:border-primary/40 group-hover:text-primary",
                        )}
                        aria-hidden
                      >
                        {isSelected ? <Check className="size-4" /> : rank + 1}
                      </span>

                      <div className="pr-10">
                        <div className="flex flex-wrap items-center gap-2">
                          {isNearest && (
                            <span className="rounded-full bg-success/10 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-success">
                              Le plus proche
                            </span>
                          )}
                          <span className="text-xs font-semibold text-primary">
                            {candidate.carrierName}
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm font-bold leading-snug text-foreground sm:text-base">
                          {candidate.name}
                        </p>
                      </div>

                      <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-[1fr_auto] sm:items-end">
                        <div className="flex min-w-0 items-start gap-2">
                          <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                          <span className="leading-relaxed">
                            {candidate.street}
                            <br />
                            {candidate.postalCode} {candidate.city}
                          </span>
                        </div>
                        {candidate.distanceMeters !== null && (
                          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 font-bold tabular-nums text-foreground">
                            <Navigation className="size-3" aria-hidden />
                            {formatDistance(candidate.distanceMeters)}
                          </span>
                        )}
                      </div>

                      {candidate.openingTimes[0] && (
                        <p className="mt-3 flex items-center gap-2 border-t border-border/70 pt-3 text-xs text-muted-foreground">
                          <Clock3 className="size-4 shrink-0 text-primary" aria-hidden />
                          <span className="truncate">{candidate.openingTimes[0]}</span>
                        </p>
                      )}

                      <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary">
                        {isSelected ? "Ce relais est sélectionné" : "Choisir ce relais"}
                        {!isSelected && <span aria-hidden>→</span>}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className="grid min-h-72 place-items-center p-6 text-center">
              <div className="max-w-xs">
                <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Search className="size-5" aria-hidden />
                </span>
                <p className="mt-3 font-bold text-foreground">Aucun relais dans ce filtre</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Les relais sont bien disponibles. Modifiez simplement votre recherche.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="focus-ring mt-4 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground"
                >
                  Voir tous les relais
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="relative min-h-72 overflow-hidden bg-muted/35 p-5 sm:p-6">
          <span
            className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full border-[28px] border-primary/[0.045]"
            aria-hidden
          />
          {selected ? (
            <SelectedPoint point={selected} />
          ) : (
            <SelectionPrompt nearest={rankedPoints[0]} />
          )}
        </aside>
      </div>
    </section>
  );
}

function SelectedPoint({ point }: { point: ServicePoint }) {
  return (
    <div className="relative flex h-full flex-col" aria-live="polite">
      <span className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[0_10px_25px_-12px_rgba(234,82,17,0.9)]">
        <Check className="size-5" aria-hidden />
      </span>
      <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-primary">
        Votre point de dépôt
      </p>
      <h4 className="mt-1 font-display text-2xl leading-tight text-foreground">
        {point.name}
      </h4>
      <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
        <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <span>
          {point.street}
          <br />
          {point.postalCode} {point.city}
        </span>
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <DetailStat label="Transporteur" value={point.carrierName} />
        <DetailStat
          label="Distance"
          value={
            point.distanceMeters === null ? "Non précisée" : formatDistance(point.distanceMeters)
          }
        />
      </div>

      {point.openingTimes.length > 0 && (
        <div className="mt-5 rounded-2xl border border-border/80 bg-surface-elevated/80 p-4">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-foreground">
            <Clock3 className="size-4 text-primary" aria-hidden />
            Horaires communiqués
          </p>
          <ul className="mt-2 space-y-1 text-xs leading-relaxed text-muted-foreground">
            {point.openingTimes.map((openingTime, index) => (
              <li key={`${openingTime}-${index}`}>{openingTime}</li>
            ))}
          </ul>
        </div>
      )}

      <a
        href={directionsUrl(point)}
        target="_blank"
        rel="noreferrer"
        className="focus-ring mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-primary/25 bg-surface-elevated px-4 text-sm font-bold text-primary transition-colors hover:bg-primary/5"
      >
        Ouvrir l&apos;itinéraire
        <ExternalLink className="size-4" aria-hidden />
      </a>
      <p className="mt-2 text-center text-[0.7rem] leading-relaxed text-muted-foreground">
        L&apos;itinéraire s&apos;ouvre dans votre application de cartes avec l&apos;adresse exacte.
      </p>
    </div>
  );
}

function SelectionPrompt({ nearest }: { nearest: ServicePoint }) {
  return (
    <div className="relative flex h-full flex-col justify-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Store className="size-6" aria-hidden />
      </span>
      <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-primary">
        Une décision simple
      </p>
      <h4 className="mt-1 font-display text-2xl leading-tight text-foreground">
        Le bon relais, sans chercher sur une carte.
      </h4>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Comparez la distance, l&apos;adresse et les horaires. Touchez un relais pour le
        sélectionner et vérifier son itinéraire.
      </p>
      {nearest.distanceMeters !== null && (
        <div className="mt-5 rounded-2xl border border-primary/15 bg-surface-elevated/80 p-4">
          <p className="text-xs font-bold text-primary">Le plus proche</p>
          <p className="mt-1 text-sm font-bold text-foreground">{nearest.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            à {formatDistance(nearest.distanceMeters)} de votre adresse
          </p>
        </div>
      )}
    </div>
  );
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-primary/[0.06] p-3">
      <p className="text-[0.65rem] font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 truncate text-xs font-bold text-foreground" title={value}>
        {value}
      </p>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "focus-ring shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-surface-elevated text-muted-foreground hover:border-primary/30 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function compareServicePoints(left: ServicePoint, right: ServicePoint) {
  if (left.distanceMeters === null && right.distanceMeters === null) {
    return left.name.localeCompare(right.name, "fr");
  }
  if (left.distanceMeters === null) {
    return 1;
  }
  if (right.distanceMeters === null) {
    return -1;
  }
  return left.distanceMeters - right.distanceMeters;
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr");
}

function servicePointKey(point: ServicePoint) {
  return `${point.carrier}:${point.code}`;
}

function directionsUrl(point: ServicePoint) {
  const destination = encodeURIComponent(`${point.latitude},${point.longitude}`);
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
}
