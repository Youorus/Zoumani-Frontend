"use client";

import {
  ArrowLeftRight,
  Check,
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
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
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
 * Un sélecteur **multiple** : quelqu'un envoie rarement une seule chose.
 * Ne rien cocher reste un choix valide — on cherche alors tous les
 * voyageurs du trajet — et le libellé le dit, pour qu'on ne croie pas
 * une sélection obligatoire.
 *
 * Il reprend l'apparence du champ qu'il remplace : même typographie,
 * même panneau, mêmes couleurs. Ce qui change est ce qu'on demande, pas
 * la façon de le demander.
 */
function ContentPicker({
  categories,
  selected,
  onToggle,
  allLabel,
  placeholder,
}: ContentPickerProps) {
  const [ouvert, setOuvert] = useState(false);
  const choisies = categories.filter((category) => selected.includes(category.code));

  const resume =
    choisies.length === 0
      ? allLabel
      : choisies.length === 1
        ? choisies[0].label
        : `${choisies.length} types`;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOuvert(!ouvert)}
        aria-expanded={ouvert}
        aria-haspopup="listbox"
        className="focus-ring mt-1 flex w-full items-center justify-between gap-2 text-left font-bold text-marketing-panel-foreground"
      >
        <span className="truncate">{categories.length === 0 ? placeholder : resume}</span>
      </button>

      {ouvert && categories.length > 0 && (
        <>
          {/* Ferme au clic extérieur, sans piéger le focus : le champ
              voisin doit rester accessible d'une seule action. */}
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOuvert(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <ul
            role="listbox"
            aria-multiselectable
            className="absolute left-0 top-full z-50 mt-3 max-h-72 w-[16rem] overflow-y-auto rounded-md border border-marketing-panel-border bg-marketing-panel p-1 shadow-[0_24px_60px_-24px_rgb(52_24_7_/_0.45)]"
          >
            {categories.map((category) => {
              const choisie = selected.includes(category.code);
              return (
                <li key={category.code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={choisie}
                    onClick={() => onToggle(category.code)}
                    className="flex w-full items-center gap-2.5 rounded-sm px-2 py-2.5 text-left text-sm text-marketing-panel-foreground hover:bg-primary/10"
                  >
                    <span
                      aria-hidden
                      className={`grid size-4 shrink-0 place-items-center rounded-sm border ${
                        choisie
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-marketing-panel-border"
                      }`}
                    >
                      {choisie && <Check className="size-3" />}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{category.label}</span>
                    <span className="shrink-0 text-xs text-marketing-panel-muted-foreground">
                      {category.unit === "piece" ? "pièce" : "kg"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
