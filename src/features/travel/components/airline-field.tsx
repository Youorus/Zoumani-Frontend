"use client";

import { useEffect, useId, useState } from "react";

import { searchAirlines } from "../api/travel-client";
import type { Airline } from "../types/travel.types";

interface AirlineFieldProps {
  value: Airline | null;
  onChange: (airline: Airline | null) => void;
  /** Ce que la personne a tapé quand aucune suggestion ne correspond. */
  fallbackCode: string;
  onFallbackChange: (code: string) => void;
}

const DEBOUNCE_MS = 200;

/**
 * Le champ de compagnie, cherché par nom.
 *
 * ═══ Personne ne connaît son code IATA ═══
 *
 * Un champ de deux caractères demande un savoir que le voyageur n'a
 * pas : il tape « Air France » et rien ne se passe. La recherche porte
 * donc sur le **nom**, et le code n'est qu'un détail que le serveur
 * reçoit.
 *
 * ═══ Une compagnie absente ne bloque personne ═══
 *
 * Le référentiel couvre le corridor desservi, pas les huit cents
 * compagnies du monde. Quand rien ne correspond, la frappe est retenue
 * telle quelle si elle ressemble à un code : c'est la source de vols qui
 * tranchera. Refuser ici bloquerait un voyageur pour une lacune de notre
 * liste.
 */
export function AirlineField({
  value,
  onChange,
  fallbackCode,
  onFallbackChange,
}: AirlineFieldProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<Airline[]>([]);
  const fieldId = useId();

  const tropCourt = query.trim().length < 2;

  useEffect(() => {
    if (tropCourt) {
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      searchAirlines(query, controller.signal)
        .then(setResults)
        .catch(() => setResults([]));
    }, DEBOUNCE_MS);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query, tropCourt]);

  const suggestions = tropCourt ? [] : results;
  // Une frappe de deux ou trois caractères sans suggestion ressemble à un
  // code : on la propose telle quelle plutôt que de laisser un cul-de-sac.
  const codeBrut = query.trim().toUpperCase();
  const proposerLeCodeBrut =
    !tropCourt && suggestions.length === 0 && /^[A-Z0-9]{2,3}$/.test(codeBrut);

  return (
    <div className="relative">
      <label className="mb-1.5 block text-sm font-medium" htmlFor={fieldId}>
        Compagnie
      </label>

      {value ? (
        <button
          type="button"
          onClick={() => {
            onChange(null);
            setQuery("");
            setIsOpen(true);
          }}
          className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2.5 text-left"
        >
          <span className="min-w-0 truncate">
            <span className="font-medium">{value.name}</span>
            <span className="ml-2 font-mono text-sm text-muted-foreground">
              {value.iata}
            </span>
          </span>
          <span aria-hidden className="shrink-0 text-muted-foreground">
            ✕
          </span>
        </button>
      ) : (
        <input
          id={fieldId}
          type="text"
          autoComplete="off"
          value={query || fallbackCode}
          placeholder="Air France"
          onChange={(event) => {
            setQuery(event.target.value);
            onFallbackChange("");
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5"
        />
      )}

      {isOpen && !value && (suggestions.length > 0 || proposerLeCodeBrut) && (
        <ul
          role="listbox"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-border bg-background shadow-lg"
        >
          {suggestions.map((airline) => (
            <li key={airline.iata}>
              <button
                type="button"
                onClick={() => {
                  onChange(airline);
                  setQuery("");
                  setIsOpen(false);
                }}
                className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-muted"
              >
                <span className="min-w-0 truncate">{airline.name}</span>
                <span className="shrink-0 font-mono text-sm text-muted-foreground">
                  {airline.iata}
                </span>
              </button>
            </li>
          ))}
          {proposerLeCodeBrut && (
            <li>
              <button
                type="button"
                onClick={() => {
                  onFallbackChange(codeBrut);
                  setQuery("");
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2.5 text-left text-sm hover:bg-muted"
              >
                Utiliser le code <span className="font-mono">{codeBrut}</span>
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
