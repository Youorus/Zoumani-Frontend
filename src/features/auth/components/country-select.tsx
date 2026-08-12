"use client";

import { useMemo } from "react";

import { Combobox, type ComboboxOption } from "@/components/ui/combobox";

import { usePhoneCountries } from "../hooks/use-phone-countries";
import styles from "./auth-view.module.css";

/**
 * Le choix d'un pays, partout où l'on en demande un.
 *
 * ═══ Pourquoi cette brique existe ═══
 *
 * Trois écrans demandent un pays : le téléphone à l'inscription, la
 * nationalité et la résidence à la vérification. Trois champs de deux
 * lettres tapés à la main, c'était trois occasions d'écrire « CAM » ou
 * « FRA » et de se faire refuser sans comprendre. Et trois copies du
 * même code à faire diverger.
 *
 * Ici, un seul composant, alimenté par **le même référentiel** que le
 * sélecteur d'indicatif — celui que l'API produit à partir de la
 * bibliothèque qui valide les numéros. Un pays proposé est donc toujours
 * un pays accepté, dans les trois écrans à la fois.
 *
 * ═══ Ce qui change d'un usage à l'autre ═══
 *
 * Rien, sauf l'indicatif : il a du sens à côté d'un numéro de téléphone,
 * pas à côté d'une nationalité. `showCallingCode` est la seule différence
 * entre les deux emplois — et elle tient en une ligne plutôt qu'en un
 * second composant.
 */
export function CountrySelect({
  language,
  value,
  onChange,
  ariaLabel,
  placeholder,
  emptyText,
  showCallingCode = false,
}: {
  language: string;
  value: string;
  onChange: (code: string) => void;
  ariaLabel: string;
  placeholder: string;
  emptyText: string;
  /** Affiche « +237 » sous le nom. Utile pour un téléphone, pas ailleurs. */
  showCallingCode?: boolean;
}) {
  const { countries, loading, failed } = usePhoneCountries(language, "CM");

  const options = useMemo<ComboboxOption[]>(
    () =>
      countries.map((country) => ({
        value: country.code,
        label: country.name,
        description: showCallingCode ? country.callingCode : undefined,
        icon: (
          <span className={styles.flag} aria-hidden="true">
            {country.flag}
          </span>
        ),
        triggerIcon: (
          <span className={styles.flag} aria-hidden="true">
            {country.flag}
          </span>
        ),
        // Le nom, le code ISO et l'indicatif : quelqu'un qui tape
        // « 237 », « cm » ou « camer » doit trouver le Cameroun.
        keywords: [
          country.code,
          country.callingCode,
          country.callingCode.replace("+", ""),
        ],
      })),
    [countries, showCallingCode],
  );

  // Le référentiel n'a pas répondu : on laisse saisir le code à la main
  // plutôt que d'afficher une liste vide, qui rendrait le formulaire
  // impossible à soumettre.
  if (failed) {
    return (
      <input
        aria-label={ariaLabel}
        maxLength={2}
        placeholder="CM"
        value={value}
        onChange={(event) => onChange(event.target.value.toUpperCase())}
        className="focus-ring w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm"
      />
    );
  }

  return (
    <Combobox
      ariaLabel={ariaLabel}
      emptyText={emptyText}
      options={options}
      placeholder={loading ? "…" : placeholder}
      searchPlaceholder={placeholder}
      value={value}
      onValueChange={onChange}
    />
  );
}
