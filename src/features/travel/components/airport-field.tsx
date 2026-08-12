"use client";

import { useId, useState } from "react";

import { cn } from "@/lib/utils/cn";

import { useAirportSearch } from "../hooks/use-airport-search";
import type { Airport } from "../types/travel.types";

interface AirportFieldProps {
  label: string;
  placeholder: string;
  value: Airport | null;
  onChange: (airport: Airport | null) => void;
  error?: string;
}

/**
 * Le champ d'aéroport, avec ses suggestions.
 *
 * Il ne rend **jamais** une chaîne libre : tant qu'aucune suggestion n'est
 * choisie, la valeur reste `null`. C'est délibéré. Accepter « Paris »
 * tel quel obligerait le serveur à deviner de quel terrain il s'agit, et
 * un voyage se retrouverait rattaché à Orly quand le billet dit Roissy.
 *
 * La ville et le pays s'affichent sous le champ une fois le choix fait :
 * le voyageur vérifie d'un coup d'œil qu'il n'a pas pris l'homonyme.
 */
export function AirportField({
  label,
  placeholder,
  value,
  onChange,
  error,
}: AirportFieldProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { results, isSearching } = useAirportSearch(query);
  const listId = useId();

  function select(airport: Airport) {
    onChange(airport);
    setQuery("");
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <label className="mb-1.5 block text-sm font-medium" htmlFor={listId}>
        {label}
      </label>

      {value ? (
        <button
          type="button"
          onClick={() => {
            onChange(null);
            setIsOpen(true);
          }}
          className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5 text-left"
        >
          <span>
            <span className="font-medium">{value.city || value.name}</span>
            <span className="ml-2 text-sm text-muted-foreground">
              {value.iata} · {value.country}
            </span>
          </span>
          <span aria-hidden className="text-muted-foreground">
            ✕
          </span>
        </button>
      ) : (
        <input
          id={listId}
          type="text"
          autoComplete="off"
          value={query}
          placeholder={placeholder}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className={cn(
            "w-full rounded-lg border bg-background px-3 py-2.5",
            error ? "border-destructive" : "border-border",
          )}
        />
      )}

      {isOpen && !value && results.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-border bg-background shadow-lg"
        >
          {results.map((airport) => (
            <li key={airport.iata}>
              <button
                type="button"
                onClick={() => select(airport)}
                className="flex w-full items-start justify-between gap-3 px-3 py-2.5 text-left hover:bg-muted"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">
                    {airport.city || airport.name}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {airport.name}
                  </span>
                </span>
                <span className="shrink-0 text-sm font-mono text-muted-foreground">
                  {airport.iata}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {isSearching && !value && (
        <p className="mt-1 text-xs text-muted-foreground">Recherche…</p>
      )}
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}
