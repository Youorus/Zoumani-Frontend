"use client";

import {
  Check,
  Clock3,
  ExternalLink,
  List,
  Map as MapIcon,
  MapPin,
  Navigation,
  Search,
  X,
} from "lucide-react";
import { useDeferredValue, useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/utils/cn";

import { formatDistance, type ServicePoint } from "../types/trip.types";
import { ServicePointsMap } from "./service-points-map";

interface ServicePointSelectorProps {
  points: ServicePoint[];
  center: { latitude: number; longitude: number };
  selected: ServicePoint | null;
  onSelect: (point: ServicePoint | null) => void;
}

const ALL_CARRIERS = "all";

/**
 * Sélecteur synchronisé : la liste sert à comparer et la carte à se repérer.
 * Les deux surfaces pilotent un seul choix métier contrôlé par le parent.
 */
export function ServicePointSelector({
  points,
  center,
  selected,
  onSelect,
}: ServicePointSelectorProps) {
  const searchId = useId();
  const titleId = useId();
  const listPanelId = useId();
  const mapPanelId = useId();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [carrier, setCarrier] = useState(ALL_CARRIERS);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const pointButtons = useRef(new Map<string, HTMLButtonElement>());

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
    return matchesCarrier && pointMatchesSearch(point, normalizedQuery);
  });

  useEffect(() => {
    if (!selected) {
      return;
    }
    const button = pointButtons.current.get(servicePointKey(selected));
    if (!button?.scrollIntoView) {
      return;
    }
    button.scrollIntoView({
      block: "nearest",
      behavior: prefersReducedMotion() ? "instant" : "smooth",
    });
  }, [selected]);

  if (points.length === 0) {
    return null;
  }

  function resetFilters() {
    setQuery("");
    setCarrier(ALL_CARRIERS);
  }

  function updateQuery(value: string) {
    setQuery(value);
    if (selected && !pointMatchesSearch(selected, normalizeSearch(value))) {
      onSelect(null);
    }
  }

  function updateCarrier(value: string) {
    setCarrier(value);
    if (selected && value !== ALL_CARRIERS && selected.carrier !== value) {
      onSelect(null);
    }
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
              onChange={(event) => updateQuery(event.target.value)}
              placeholder="Nom, rue ou ville"
              className="focus-ring h-11 w-full rounded-xl border border-border bg-surface-elevated pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground"
            />
            {query && (
              <button
                type="button"
                onClick={() => updateQuery("")}
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
              onClick={() => updateCarrier(ALL_CARRIERS)}
            >
              Tous
            </FilterButton>
            {carriers.map((candidate) => (
              <FilterButton
                key={candidate.code}
                active={carrier === candidate.code}
                onClick={() => updateCarrier(candidate.code)}
              >
                {candidate.label}
              </FilterButton>
            ))}
          </div>
        )}

        <div
          className="mt-4 grid grid-cols-2 rounded-xl border border-border bg-surface-elevated p-1 lg:hidden"
          aria-label="Mode d'affichage des relais"
        >
          <ViewButton
            active={mobileView === "list"}
            controls={listPanelId}
            icon={List}
            onClick={() => setMobileView("list")}
          >
            Liste
          </ViewButton>
          <ViewButton
            active={mobileView === "map"}
            controls={mapPanelId}
            icon={MapIcon}
            onClick={() => setMobileView("map")}
          >
            Carte
          </ViewButton>
        </div>
      </header>

      <div className="grid lg:grid-cols-[minmax(21rem,0.9fr)_minmax(24rem,1.1fr)]">
        <div
          id={listPanelId}
          className={cn(
            "border-border lg:block lg:border-r",
            mobileView === "list" ? "block" : "hidden",
          )}
        >
          {visiblePoints.length > 0 ? (
            <ol
              className="max-h-[34rem] space-y-2 overflow-y-auto p-3 sm:p-4"
              aria-label="Points relais disponibles"
              aria-live="polite"
            >
              {visiblePoints.map((candidate, index) => {
                const globalRank = rankedPoints.findIndex(
                  (point) => servicePointKey(point) === servicePointKey(candidate),
                );
                const isSelected =
                  selected !== null && servicePointKey(candidate) === servicePointKey(selected);
                const isNearest = globalRank === 0 && candidate.distanceMeters !== null;

                return (
                  <li key={servicePointKey(candidate)}>
                    <button
                      ref={(element) => {
                        const key = servicePointKey(candidate);
                        if (element) {
                          pointButtons.current.set(key, element);
                        } else {
                          pointButtons.current.delete(key);
                        }
                      }}
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
                        {isSelected ? <Check className="size-4" /> : index + 1}
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

        <div
          id={mapPanelId}
          className={cn(
            "relative min-h-[34rem] bg-muted/35 lg:block",
            mobileView === "map" ? "block" : "hidden",
          )}
        >
          <ServicePointsMap
            points={visiblePoints}
            center={center}
            selected={selected}
            isVisible={mobileView === "map"}
            onSelect={onSelect}
          />
          {selected ? (
            <MapSelectionCard point={selected} />
          ) : (
            <div className="pointer-events-none absolute left-3 top-3 z-[500] max-w-[15rem] rounded-2xl border border-primary/15 bg-surface-elevated/95 p-3 shadow-lifted backdrop-blur-sm">
              <p className="text-xs font-bold text-primary">Touchez un repère</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Les numéros correspondent exactement à la liste des relais.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function MapSelectionCard({ point }: { point: ServicePoint }) {
  return (
    <div
      className="absolute inset-x-3 bottom-7 z-[500] rounded-2xl border border-primary/20 bg-surface-elevated/95 p-4 shadow-lifted backdrop-blur-md sm:left-4 sm:right-auto sm:w-[22rem]"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
          <Check className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-primary">
            Votre point de dépôt
          </p>
          <h4 className="mt-0.5 truncate font-display text-lg leading-tight text-foreground">
            {point.name}
          </h4>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {point.street}, {point.postalCode} {point.city}
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-3 text-xs text-muted-foreground">
        {point.distanceMeters !== null && (
          <span className="inline-flex items-center gap-1.5 font-bold text-foreground">
            <Navigation className="size-3.5 text-primary" aria-hidden />
            {formatDistance(point.distanceMeters)}
          </span>
        )}
        {point.openingTimes[0] && (
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <Clock3 className="size-3.5 shrink-0 text-primary" aria-hidden />
            <span className="truncate">{point.openingTimes[0]}</span>
          </span>
        )}
      </div>
      <a
        href={directionsUrl(point)}
        target="_blank"
        rel="noreferrer"
        className="focus-ring mt-3 inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 text-xs font-bold text-primary-foreground"
      >
        Voir l&apos;itinéraire
        <ExternalLink className="size-3.5" aria-hidden />
      </a>
    </div>
  );
}

function ViewButton({
  active,
  controls,
  icon: Icon,
  onClick,
  children,
}: {
  active: boolean;
  controls: string;
  icon: typeof List;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-controls={controls}
      className={cn(
        "focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-lg text-sm font-bold transition-colors",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="size-4" aria-hidden />
      {children}
    </button>
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

function pointMatchesSearch(point: ServicePoint, normalizedQuery: string) {
  if (!normalizedQuery) {
    return true;
  }
  const searchable = normalizeSearch(
    `${point.name} ${point.street} ${point.postalCode} ${point.city} ${point.carrierName}`,
  );
  return searchable.includes(normalizedQuery);
}

function servicePointKey(point: ServicePoint) {
  return `${point.carrier}:${point.code}`;
}

function directionsUrl(point: ServicePoint) {
  const destination = encodeURIComponent(`${point.latitude},${point.longitude}`);
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
}

function prefersReducedMotion() {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
