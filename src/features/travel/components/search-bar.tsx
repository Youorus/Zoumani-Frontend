"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { fetchCatalog } from "../api/travel-client";
import type { Airport, Catalog } from "../types/travel.types";
import { AirportField } from "./airport-field";

interface SearchBarProps {
  /** Valeurs initiales, pour réafficher une recherche en cours. */
  initial?: { origin?: string; destination?: string; categories?: string[] };
  /** Rendu compact pour l'espace connecté, ample pour la page d'accueil. */
  tone?: "marketing" | "app";
}

/**
 * La barre de recherche d'un expéditeur.
 *
 * ═══ Ce qu'on demande a changé ═══
 *
 * Le poids ne décide de rien à ce stade. Quelqu'un qui veut envoyer
 * « des vêtements et un téléphone » ne sait pas encore combien ça pèse,
 * et le lui demander d'abord le fait deviner. Ce qui filtre vraiment,
 * c'est la **nature** de ce qu'il envoie : un voyageur qui refuse
 * l'électronique n'a aucun intérêt à apparaître.
 *
 * Le poids revient plus tard, à la réservation, quand la catégorie est
 * connue et que le tarif s'y applique.
 *
 * ═══ Les aéroports viennent du référentiel ═══
 *
 * Plus de liste de villes figée dans le code : une ville absente rendait
 * la recherche impossible sans que rien ne l'explique. Le champ
 * interroge les quatre mille aéroports du serveur.
 */
export function SearchBar({ initial, tone = "app" }: SearchBarProps) {
  const router = useRouter();
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [origin, setOrigin] = useState<Airport | null>(null);
  const [destination, setDestination] = useState<Airport | null>(null);
  const [categories, setCategories] = useState<string[]>(initial?.categories ?? []);
  const [ouvert, setOuvert] = useState(false);

  useEffect(() => {
    let vivant = true;
    void fetchCatalog()
      .then((valeur) => vivant && setCatalog(valeur))
      .catch(() => undefined);
    return () => {
      vivant = false;
    };
  }, []);

  const pret =
    origin !== null && destination !== null && origin.iata !== destination.iata;

  function chercher() {
    if (!origin || !destination) {
      return;
    }
    const params = new URLSearchParams({
      origin: origin.iata,
      destination: destination.iata,
    });
    for (const code of categories) {
      params.append("categories", code);
    }
    router.push(`/search?${params.toString()}`);
  }

  const choisies = (catalog?.categories ?? []).filter((c) => categories.includes(c.code));
  const resume =
    choisies.length === 0
      ? "Tout type de colis"
      : choisies.length <= 2
        ? choisies.map((c) => c.label).join(", ")
        : `${choisies.length} types de colis`;

  return (
    <div
      className={
        tone === "marketing"
          ? "rounded-2xl border border-marketing-panel-border bg-marketing-panel p-4 sm:p-5"
          : "rounded-2xl border border-border bg-background p-4"
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <AirportField
          label="Je pars de"
          placeholder="Ville ou aéroport"
          value={origin}
          onChange={setOrigin}
        />
        <AirportField
          label="J'envoie vers"
          placeholder="Ville ou aéroport"
          value={destination}
          onChange={setDestination}
          error={
            origin && origin.iata === destination?.iata
              ? "Choisissez deux villes différentes."
              : undefined
          }
        />
      </div>

      <div className="mt-3">
        <button
          type="button"
          onClick={() => setOuvert(!ouvert)}
          aria-expanded={ouvert}
          className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5 text-left text-sm"
        >
          <span>
            <span className="block text-xs text-muted-foreground">
              Ce que j&apos;envoie
            </span>
            <span className="block">{resume}</span>
          </span>
          <span aria-hidden className="text-muted-foreground">
            {ouvert ? "▲" : "▼"}
          </span>
        </button>

        {ouvert && catalog && (
          <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg border border-border p-2.5">
            {catalog.categories.map((category) => {
              const choisie = categories.includes(category.code);
              return (
                <button
                  key={category.code}
                  type="button"
                  aria-pressed={choisie}
                  onClick={() =>
                    setCategories((courant) =>
                      courant.includes(category.code)
                        ? courant.filter((autre) => autre !== category.code)
                        : [...courant, category.code],
                    )
                  }
                  className={`rounded-lg border px-2.5 py-2 text-left text-xs transition-colors ${
                    choisie
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-foreground/20"
                  }`}
                >
                  {category.label}
                </button>
              );
            })}
            {/* Ne rien cocher est un choix valide : on cherche alors
                tous les voyageurs du trajet. Le dire évite de croire
                qu'une sélection est obligatoire. */}
            {categories.length > 0 && (
              <button
                type="button"
                onClick={() => setCategories([])}
                className="col-span-2 py-1.5 text-xs text-muted-foreground underline"
              >
                Tout désélectionner
              </button>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={chercher}
        disabled={!pret}
        className="mt-3 w-full rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground transition-opacity disabled:opacity-40"
      >
        Trouver un voyageur
      </button>
    </div>
  );
}
