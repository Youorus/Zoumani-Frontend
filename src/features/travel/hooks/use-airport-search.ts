"use client";

import { useEffect, useState } from "react";

import { searchAirports } from "../api/travel-client";
import type { Airport } from "../types/travel.types";

/**
 * Délai avant d'interroger le serveur, en millisecondes.
 *
 * Sans lui, taper « douala » lance six requêtes dont cinq sont périmées
 * avant d'arriver. Deux cent cinquante millisecondes est le seuil
 * au-delà duquel une frappe se sent ralentie ; en deçà, on paie du
 * réseau pour rien.
 */
const DEBOUNCE_MS = 250;

/**
 * Suggère des aéroports au fil de la frappe.
 *
 * Deux précautions qui décident de la qualité perçue. La requête est
 * différée, pour ne pas tirer à chaque touche. Et elle est **annulée**
 * quand la frappe reprend : sans cela, une réponse lente à « dou »
 * arriverait après celle de « douala » et écraserait la bonne liste par
 * l'ancienne — le bug classique de l'autocomplétion, qui se manifeste
 * précisément sur les connexions lentes.
 */
export function useAirportSearch(query: string) {
  const [fetched, setFetched] = useState<Airport[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  // Dérivé, jamais stocké : sous deux caractères il n'y a rien à
  // afficher, et l'écrire dans un état obligerait à le remettre à zéro
  // depuis un effet — ce qui ajoute un rendu pour une valeur déjà connue.
  const tropCourt = query.trim().length < 2;

  useEffect(() => {
    if (tropCourt) {
      return;
    }

    const controller = new AbortController();

    // `setIsFetching` est appelé dans le `setTimeout` et non dans le
    // corps de l'effet : un `setState` synchrone y déclencherait un
    // rendu en cascade à chaque frappe, pour un indicateur qui n'a de
    // sens qu'une fois la requête réellement partie.
    const timer = setTimeout(() => {
      setIsFetching(true);
      searchAirports(query, controller.signal)
        .then(setFetched)
        .catch(() => {
          // Une recherche annulée n'est pas un incident, et une panne de
          // suggestion ne doit pas interrompre la saisie : le voyageur
          // peut toujours écrire un code IATA à la main.
          setFetched([]);
        })
        .finally(() => setIsFetching(false));
    }, DEBOUNCE_MS);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query, tropCourt]);

  return {
    results: tropCourt ? [] : fetched,
    isSearching: !tropCourt && isFetching,
  };
}
