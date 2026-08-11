"use client";

import { useEffect, useState } from "react";

import {
  toDisplayCountries,
  guessCountry,
  type PhoneCountry,
  type RawPhoneCountry,
} from "../lib/phone-countries";

/**
 * Charge le référentiel des pays, au moment où il sert.
 *
 * ═══ Pourquoi pas au rendu de la page ═══
 *
 * Le sélecteur n'apparaît qu'à l'écran d'inscription, c'est-à-dire pour
 * les nouveaux venus seulement. Embarquer deux cent quarante-cinq pays
 * dans la page de connexion les ferait payer à tous ceux qui ne font que
 * se reconnecter — la majorité.
 *
 * ═══ Pourquoi une seule requête suffit ═══
 *
 * L'API pose un `Cache-Control` de vingt-quatre heures : le navigateur ne
 * redemande pas la liste d'un écran à l'autre, ni d'une visite à la
 * suivante dans la journée.
 *
 * ═══ Ce qui se passe si l'appel échoue ═══
 *
 * `countries` reste vide et `failed` passe à vrai. L'appelant affiche
 * alors une saisie internationale libre plutôt qu'un sélecteur vide : un
 * référentiel indisponible ne doit pas empêcher de créer un compte.
 */
export function usePhoneCountries(locale: string, fallbackCountry: string) {
  const [countries, setCountries] = useState<PhoneCountry[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [suggested, setSuggested] = useState<string | null>(null);

  useEffect(() => {
    // Annulé au démontage : quelqu'un qui revient en arrière pendant le
    // chargement ne doit pas provoquer une écriture d'état sur un
    // composant disparu.
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch("/api/proxy/auth/phone-countries", {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const raw = (await response.json()) as RawPhoneCountry[];
        const prepared = toDisplayCountries(raw, locale);
        setCountries(prepared);
        setSuggested(
          guessCountry(
            prepared,
            // La langue du navigateur d'abord — elle porte souvent la
            // région — puis celle de l'interface en dernier recours.
            [...(navigator.languages ?? [navigator.language]), locale],
            fallbackCountry,
          ),
        );
      } catch (error) {
        if (!controller.signal.aborted) {
          setFailed(true);
        }
        void error;
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => controller.abort();
  }, [locale, fallbackCountry]);

  return { countries, loading, failed, suggested };
}
