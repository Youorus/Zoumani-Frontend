"use client";

import {
  ArrowLeftRight,
  Check,
  ChevronDown,
  CircleCheck,
  MapPin,
  Package,
  Search,
  ShieldCheck,
  LoaderCircle,
} from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useState, useTransition } from "react";

import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { findAirportByCode, fetchCatalog } from "@/features/travel/api/travel-client";
import { useAirportSearch } from "@/features/travel/hooks/use-airport-search";
import type { Airport, ParcelCategory } from "@/features/travel/types/travel.types";
import { cn } from "@/lib/utils/cn";

import type { HomeContent, HomeLanguage } from "./home-content";

const guaranteeIcons = [CircleCheck, ShieldCheck, ShieldCheck, CircleCheck] as const;

interface SearchFieldProps {
  icon: typeof MapPin;
  label: string;
  children: ReactNode;
  className?: string;
  compact?: boolean;
}

function SearchField({
  icon: Icon,
  label,
  children,
  className,
  compact = false,
}: SearchFieldProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-marketing-panel-border bg-marketing-panel px-4 transition-colors focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/12",
        compact ? "min-h-15" : "min-h-19",
        className,
      )}
    >
      <Icon
        className={cn("shrink-0 text-primary", compact ? "size-5" : "size-6")}
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-medium text-marketing-panel-muted-foreground">
          {label}
        </span>
        {children}
      </span>
    </div>
  );
}

interface ShipmentSearchProps {
  className?: string;
  copy: HomeContent["search"];
  language: HomeLanguage;
  /** Version resserrée pour garder les résultats visibles sous la recherche. */
  variant?: "hero" | "compact";
  /** Critères déjà actifs, notamment lorsqu'ils viennent de l'URL. */
  initialFilters?: {
    origin?: string;
    destination?: string;
    categories?: string[];
  };
}

export function ShipmentSearch({
  className,
  copy,
  language,
  variant = "hero",
  initialFilters,
}: ShipmentSearchProps) {
  const router = useRouter();
  const compact = variant === "compact";
  const initialOrigin = initialFilters?.origin;
  const initialDestination = initialFilters?.destination;
  const initialCategoryKey = (initialFilters?.categories ?? []).join(",");
  const [departure, setDeparture] = useState<Airport | null>(null);
  const [destination, setDestination] = useState<Airport | null>(null);
  const [contents, setContents] = useState<string[]>(() =>
    initialCategoryKey ? initialCategoryKey.split(",") : [],
  );
  const [categories, setCategories] = useState<ParcelCategory[]>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(true);
  const [routeError, setRouteError] = useState("");
  const [isNavigating, startNavigation] = useTransition();

  // Les codes présents dans l'URL sont résolus par le même référentiel
  // backend que l'autocomplétion. La barre n'entretient ainsi aucune
  // seconde base de villes susceptible de diverger de l'API.
  useEffect(() => {
    let active = true;
    const originCode = initialOrigin?.toUpperCase() || "CDG";
    const destinationCode = initialDestination?.toUpperCase() || "ABJ";

    void Promise.all([findAirportByCode(originCode), findAirportByCode(destinationCode)])
      .then(([originAirport, destinationAirport]) => {
        if (!active) return;
        setDeparture(originAirport);
        setDestination(destinationAirport);
      })
      .catch(() => {
        if (active) {
          setRouteError(
            language === "fr"
              ? "Impossible de charger les aéroports pour le moment."
              : "Airports could not be loaded right now.",
          );
        }
      })
      .finally(() => {
        if (active) setIsLoadingRoute(false);
      });

    return () => {
      active = false;
    };
  }, [initialDestination, initialOrigin, language]);

  // Le catalogue vient du serveur : une liste figée dans le code
  // divergerait de ce que les voyageurs peuvent réellement accepter.
  useEffect(() => {
    let vivant = true;
    void fetchCatalog()
      .then((catalogue) => vivant && setCategories(catalogue.categories))
      .catch(() => undefined);
    return () => {
      vivant = false;
    };
  }, []);

  function toggleContent(code: string) {
    setContents((courant) =>
      courant.includes(code)
        ? courant.filter((autre) => autre !== code)
        : [...courant, code],
    );
  }

  function swapLocations() {
    setDeparture(destination);
    setDestination(departure);
    setRouteError("");
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!departure || !destination) {
      setRouteError(
        language === "fr"
          ? "Choisissez un aéroport de départ et un aéroport d’arrivée."
          : "Choose a departure and an arrival airport.",
      );
      return;
    }

    setRouteError("");
    const params = new URLSearchParams({
      origin: departure.iata,
      destination: destination.iata,
    });
    for (const code of contents) {
      params.append("categories", code);
    }

    startNavigation(() => {
      router.push(`/search?${params.toString()}` as Route);
    });
  }

  return (
    <div
      id="search"
      className={cn(
        "relative z-30 mx-auto w-full max-w-[1492px] px-4 sm:px-8 lg:px-12",
        className,
      )}
    >
      <form
        onSubmit={submitSearch}
        className={cn(
          "overflow-hidden bg-marketing-panel text-marketing-panel-foreground [color-scheme:light]",
          compact
            ? "rounded-[1.15rem] border border-marketing-panel-border shadow-[0_18px_45px_-32px_rgb(13_6_2_/_0.6)]"
            : "rounded-[1.35rem] shadow-[0_28px_70px_-34px_rgb(13_6_2_/_0.7)]",
        )}
      >
        <div
          className={cn(
            "items-center border-b border-marketing-panel-border",
            compact ? "sr-only" : "flex h-12",
          )}
        >
          <div className="flex h-full w-full items-center justify-center gap-2 px-4 text-sm font-bold text-primary sm:max-w-[255px]">
            <Package className="size-5" />
            {copy.title}
          </div>
        </div>

        <div className={compact ? "p-3" : "p-4 sm:p-5"}>
          <div className="grid items-center gap-3 lg:grid-cols-[1.3fr_1.3fr_.72fr_1.08fr]">
            <SearchField icon={MapPin} label={copy.departureLabel} compact={compact}>
              <AirportCombobox
                value={departure}
                ariaLabel={copy.departureAriaLabel}
                emptyText={copy.cityEmptyText}
                groupLabel={copy.citySuggestionsLabel}
                language={language}
                onValueChange={(airport) => {
                  setDeparture(airport);
                  setRouteError("");
                }}
                placeholder={copy.cityPlaceholder}
                searchPlaceholder={copy.citySearchPlaceholder}
              />
            </SearchField>

            <div className="relative">
              <button
                type="button"
                onClick={swapLocations}
                aria-label={copy.swapLabel}
                className="focus-ring absolute top-1/2 -left-[1.65rem] z-10 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-primary text-primary-foreground shadow-soft lg:grid"
              >
                <ArrowLeftRight className="size-4" />
              </button>
              <SearchField icon={MapPin} label={copy.destinationLabel} compact={compact}>
                <AirportCombobox
                  value={destination}
                  ariaLabel={copy.destinationAriaLabel}
                  emptyText={copy.cityEmptyText}
                  groupLabel={copy.citySuggestionsLabel}
                  language={language}
                  onValueChange={(airport) => {
                    setDestination(airport);
                    setRouteError("");
                  }}
                  placeholder={copy.cityPlaceholder}
                  searchPlaceholder={copy.citySearchPlaceholder}
                />
              </SearchField>
            </div>

            <SearchField icon={Package} label={copy.contentLabel} compact={compact}>
              {/* Le poids ne décidait de rien à ce stade : quelqu'un qui
                  veut envoyer « des vêtements et un téléphone » ne sait
                  pas encore ce que ça pèse. Ce qui filtre vraiment, c'est
                  la nature de l'envoi — un voyageur qui refuse
                  l'électronique n'a aucun intérêt à apparaître. Le poids
                  revient à la réservation, quand le tarif s'y applique. */}
              <ContentPicker
                categories={categories}
                selected={contents}
                onToggle={toggleContent}
                allLabel={copy.contentAllLabel}
                placeholder={copy.contentPlaceholder}
              />
            </SearchField>

            <button
              type="submit"
              disabled={isNavigating || isLoadingRoute}
              className={cn(
                "focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5 hover:bg-primary/92",
                compact ? "min-h-14" : "min-h-16",
              )}
            >
              {isNavigating || isLoadingRoute ? (
                <LoaderCircle className="size-5 animate-spin" />
              ) : (
                <Search className="size-5" />
              )}
              {copy.submitLabel}
            </button>
          </div>

          {routeError ? (
            <p
              className="mt-3 text-center text-xs font-semibold text-destructive"
              role="alert"
            >
              {routeError}
            </p>
          ) : null}

          <div
            className={cn(
              "mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-marketing-panel-muted-foreground lg:gap-x-7",
              compact && "hidden",
            )}
          >
            {copy.guarantees.map((label, index) => {
              const Icon = guaranteeIcons[index] ?? CircleCheck;

              return (
                <div key={label} className="flex items-center gap-2">
                  <Icon className="size-4 text-warning" />
                  <span>{label}</span>
                  {index < copy.guarantees.length - 1 ? (
                    <span
                      className="ml-3 hidden text-warning lg:inline"
                      aria-hidden="true"
                    >
                      •
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </form>
    </div>
  );
}

interface AirportComboboxProps {
  value: Airport | null;
  onValueChange: (airport: Airport) => void;
  ariaLabel: string;
  emptyText: string;
  groupLabel: string;
  placeholder: string;
  searchPlaceholder: string;
  language: HomeLanguage;
}

function AirportCombobox({
  value,
  onValueChange,
  ariaLabel,
  emptyText,
  groupLabel,
  placeholder,
  searchPlaceholder,
  language,
}: AirportComboboxProps) {
  const [query, setQuery] = useState("");
  const { results, isSearching } = useAirportSearch(query);
  const airports =
    value && !results.some((airport) => airport.iata === value.iata)
      ? [value, ...results]
      : results;
  const regionNames = new Intl.DisplayNames([language], { type: "region" });

  const options: ComboboxOption[] = airports.map((airport) => ({
    value: airport.iata,
    label: `${airport.city} · ${airport.iata}`,
    description: `${airport.name} · ${regionNames.of(airport.country) ?? airport.country}`,
    keywords: [airport.city, airport.country, airport.name, airport.icao],
    icon: <span className="text-[0.65rem] font-black tracking-wide">{airport.iata}</span>,
  }));

  const contextualEmptyText =
    query.trim().length < 2
      ? language === "fr"
        ? "Saisissez au moins deux lettres."
        : "Enter at least two letters."
      : isSearching
        ? language === "fr"
          ? "Recherche dans le référentiel Zoumani…"
          : "Searching the Zoumani directory…"
        : emptyText;

  return (
    <Combobox
      value={value?.iata}
      ariaLabel={ariaLabel}
      emptyText={contextualEmptyText}
      groupLabel={groupLabel}
      onSearchValueChange={setQuery}
      onValueChange={(iata) => {
        const airport = airports.find((candidate) => candidate.iata === iata);
        if (airport) onValueChange(airport);
      }}
      options={options}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
    />
  );
}

interface ContentPickerProps {
  categories: ParcelCategory[];
  selected: string[];
  onToggle: (code: string) => void;
  allLabel: string;
  placeholder: string;
}

/**
 * Le choix de ce qu'on envoie, à la place du poids.
 *
 * ═══ Pourquoi un menu Radix et non un panneau maison ═══
 *
 * Le formulaire porte `overflow-hidden` pour ses coins arrondis : tout
 * panneau positionné en absolu s'y trouve **coupé**, et le sélecteur ne
 * s'ouvrait sur rien. Les autres champs n'avaient pas le problème parce
 * qu'ils passent par un portail, qui les rend hors de ce cadre.
 * Celui-ci fait pareil désormais.
 *
 * ═══ Choix multiple ═══
 *
 * On envoie rarement une seule chose. Ne rien cocher reste valide — on
 * cherche alors tous les voyageurs du trajet — et le libellé le dit,
 * pour qu'on ne croie pas une sélection obligatoire.
 */
function ContentPicker({
  categories,
  selected,
  onToggle,
  allLabel,
  placeholder,
}: ContentPickerProps) {
  const choisies = categories.filter((category) => selected.includes(category.code));

  const resume =
    choisies.length === 0
      ? allLabel
      : choisies.length === 1
        ? choisies[0].label
        : `${choisies.length} types`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={categories.length === 0}
        className="focus-ring mt-1 flex w-full items-center justify-between gap-2 text-left font-bold text-marketing-panel-foreground disabled:opacity-60"
      >
        <span className="truncate">{categories.length === 0 ? placeholder : resume}</span>
        <ChevronDown className="size-4 shrink-0 opacity-60" aria-hidden />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={12}
        className="max-h-72 min-w-[19rem] overflow-y-auto border-marketing-panel-border bg-marketing-panel text-marketing-panel-foreground shadow-[0_24px_60px_-24px_rgb(52_24_7_/_0.45)]"
      >
        {categories.map((category) => {
          const choisie = selected.includes(category.code);
          return (
            <DropdownMenuCheckboxItem
              key={category.code}
              checked={choisie}
              // Le menu reste ouvert : cocher trois catégories ne doit
              // pas demander de le rouvrir trois fois.
              onSelect={(event) => event.preventDefault()}
              onCheckedChange={() => onToggle(category.code)}
              // `pl-3` annule la gouttière que le composant partagé
              // réserve à sa coche : on dessine la case nous-mêmes, pour
              // qu'elle soit visible **avant** d'être cochée. Une coche
              // seule ne montre que ce qui est déjà choisi, et l'on ne
              // voit pas qu'il y a quelque chose à choisir.
              className="py-2.5 pl-3 text-marketing-panel-foreground data-[highlighted]:bg-primary/10"
            >
              <span className="flex w-full items-center gap-3">
                <span
                  aria-hidden
                  className={`grid size-[1.125rem] shrink-0 place-items-center rounded border transition-colors ${
                    choisie
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-marketing-panel-border bg-marketing-panel"
                  }`}
                >
                  {choisie && <Check className="size-3" strokeWidth={3} />}
                </span>

                {/* `flex-1` pousse l'unité contre le bord droit : toutes
                    s'alignent alors sur une même colonne, quelle que
                    soit la longueur du nom. */}
                <span className="flex-1 truncate">{category.label}</span>
                <span className="w-12 shrink-0 text-right text-xs text-marketing-panel-muted-foreground">
                  {category.unit === "piece" ? "/ pièce" : "/ kg"}
                </span>
              </span>
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
