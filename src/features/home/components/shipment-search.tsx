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
import { searchCities } from "@/features/shipment-search/data/search-cities";
import { fetchCatalog } from "@/features/travel/api/travel-client";
import type { ParcelCategory } from "@/features/travel/types/travel.types";
import { cn } from "@/lib/utils/cn";

import type { HomeContent, HomeLanguage } from "./home-content";

const guaranteeIcons = [CircleCheck, ShieldCheck, ShieldCheck, CircleCheck] as const;

/**
 * Le code IATA d'une ville du sélecteur.
 *
 * Les entrées portent leur aéroport sous la forme « Nom · CODE » : on en
 * extrait le code, qui est ce que l'API attend. Le résoudre ici évite un
 * aller-retour de plus avant d'afficher les résultats.
 */
function airportOf(cityValue: string): string {
  const ville = searchCities.find((candidate) => candidate.value === cityValue);
  const fragment = ville?.airport.split("·").pop()?.trim();
  return fragment ?? "";
}

const cityOptions: readonly ComboboxOption[] = searchCities.map((city) => ({
  value: city.value,
  label: `${city.city}, ${city.country}`,
  description: city.airport,
}));

interface SearchFieldProps {
  icon: typeof MapPin;
  label: string;
  children: ReactNode;
  className?: string;
}

function SearchField({ icon: Icon, label, children, className }: SearchFieldProps) {
  return (
    <div
      className={cn(
        "flex min-h-19 items-center gap-3 rounded-xl border border-marketing-panel-border bg-marketing-panel px-4 transition-colors focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/12",
        className,
      )}
    >
      <Icon className="size-6 shrink-0 text-primary" aria-hidden="true" />
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
  /**
   * Que faire de la recherche, quand la page sait déjà quoi en faire.
   *
   * Absent — sur la page d'accueil — la barre navigue vers `/search` : un
   * visiteur y arrive sans contexte, et une page dédiée lui en donne un,
   * partageable et indexable.
   *
   * Fourni — dans l'espace connecté — les résultats s'affichent sous la
   * barre, sans quitter l'écran. Quelqu'un qui affine sa destination trois
   * fois de suite ne doit pas traverser trois pages pour cela.
   */
  onSearch?: (filters: { from: string; to: string; weight: number }) => void;
}

export function ShipmentSearch({
  className,
  copy,
  language,
  onSearch,
}: ShipmentSearchProps) {
  const router = useRouter();
  const [departure, setDeparture] = useState("paris");
  const [destination, setDestination] = useState("abidjan");
  const [contents, setContents] = useState<string[]>([]);
  const [categories, setCategories] = useState<ParcelCategory[]>([]);
  const [isNavigating, startNavigation] = useTransition();

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
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Les villes portent leur code IATA : c'est lui que l'API attend, et
    // le résoudre ici évite un aller-retour de plus avant les résultats.
    const params = new URLSearchParams({
      origin: airportOf(departure),
      destination: airportOf(destination),
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
        className="overflow-hidden rounded-[1.35rem] bg-marketing-panel text-marketing-panel-foreground shadow-[0_28px_70px_-34px_rgb(13_6_2_/_0.7)] [color-scheme:light]"
      >
        <div className="flex h-12 items-center border-b border-marketing-panel-border">
          <div className="flex h-full w-full items-center justify-center gap-2 px-4 text-sm font-bold text-primary sm:max-w-[255px]">
            <Package className="size-5" />
            {copy.title}
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="grid items-center gap-3 lg:grid-cols-[1.3fr_1.3fr_.72fr_1.08fr]">
            <SearchField icon={MapPin} label={copy.departureLabel}>
              <Combobox
                value={departure}
                ariaLabel={copy.departureAriaLabel}
                emptyText={copy.cityEmptyText}
                groupLabel={copy.citySuggestionsLabel}
                onValueChange={setDeparture}
                options={cityOptions}
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
              <SearchField icon={MapPin} label={copy.destinationLabel}>
                <Combobox
                  value={destination}
                  ariaLabel={copy.destinationAriaLabel}
                  emptyText={copy.cityEmptyText}
                  groupLabel={copy.citySuggestionsLabel}
                  onValueChange={setDestination}
                  options={cityOptions}
                  placeholder={copy.cityPlaceholder}
                  searchPlaceholder={copy.citySearchPlaceholder}
                />
              </SearchField>
            </div>

            <SearchField icon={Package} label={copy.contentLabel}>
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
              disabled={isNavigating}
              className="focus-ring inline-flex min-h-16 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5 hover:bg-primary/92 lg:min-h-16"
            >
              {isNavigating ? (
                <LoaderCircle className="size-5 animate-spin" />
              ) : (
                <Search className="size-5" />
              )}
              {copy.submitLabel}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-marketing-panel-muted-foreground lg:gap-x-7">
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
