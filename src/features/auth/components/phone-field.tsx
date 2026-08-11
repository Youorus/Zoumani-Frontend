"use client";

import { useEffect, useMemo } from "react";

import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";

import { usePhoneCountries } from "../hooks/use-phone-countries";
import styles from "./auth-view.module.css";

/**
 * La saisie d'un numéro de téléphone : le pays, puis le numéro.
 *
 * ═══ Pourquoi deux champs et non un ═══
 *
 * Un champ libre où l'on tape « +237 699… » paraît plus simple, et l'est
 * pour qui connaît son indicatif par cœur. Il ne l'est pour personne
 * d'autre : l'utilisateur hésite entre `00237`, `+237` et `237`, oublie
 * le zéro initial du numéro national — ou l'ajoute là où il ne faut pas.
 * Le pays choisi séparément lève l'ambiguïté, et il **doit** de toute
 * façon être transmis à part : l'API le stocke pour réafficher le numéro
 * et le drapeau sans le reparser.
 *
 * ═══ Pourquoi l'exemple change avec le pays ═══
 *
 * `6 99 12 34 56` en dit plus long que « votre numéro », et il vient du
 * serveur, donc de la bibliothèque qui valide. Personne n'a besoin de
 * savoir combien de chiffres compte un mobile ivoirien : le champ le
 * montre.
 */
export function PhoneField({
  language,
  label,
  help,
  searchLabel,
  searchPlaceholder,
  emptyText,
  error,
  countryCode,
  onCountryChange,
  register,
}: {
  language: string;
  label: string;
  help: string;
  searchLabel: string;
  searchPlaceholder: string;
  emptyText: string;
  error?: string;
  countryCode: string;
  onCountryChange: (code: string) => void;
  /** Enregistrement du champ numérique auprès du formulaire. */
  register: React.ComponentProps<typeof Input>;
}) {
  const { countries, loading, failed, suggested } = usePhoneCountries(language, "CM");

  // La devinette ne s'applique qu'une fois, et seulement si la personne
  // n'a rien choisi : écraser une sélection manuelle parce que la liste
  // vient d'arriver serait insupportable.
  useEffect(() => {
    if (suggested && !countryCode) {
      onCountryChange(suggested);
    }
  }, [suggested, countryCode, onCountryChange]);

  const selected = countries.find((country) => country.code === countryCode);

  const options = useMemo<ComboboxOption[]>(
    () =>
      countries.map((country) => ({
        value: country.code,
        label: country.name,
        description: country.callingCode,
        // Le drapeau seul dans la pastille : c'est un repère visuel, pas
        // une information à lire. Il est donc masqué aux lecteurs
        // d'écran, qui annoncent déjà le nom du pays juste à côté.
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
        // Ce sur quoi la recherche mord : le nom, le code, l'indicatif
        // avec et sans le « + ». Quelqu'un qui tape « 237 » doit trouver
        // le Cameroun aussi sûrement que s'il tapait « cam ».
        keywords: [
          country.code,
          country.callingCode,
          country.callingCode.replace("+", ""),
        ],
      })),
    [countries],
  );

  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>

      <div className={styles.phoneRow}>
        <div className={styles.phoneCountry}>
          {failed ? (
            // Le référentiel n'a pas répondu. Plutôt qu'un sélecteur vide
            // — un formulaire impossible à soumettre — on laisse saisir
            // le code du pays à la main. Le serveur validera.
            <Input
              aria-label={searchLabel}
              maxLength={2}
              placeholder="CM"
              value={countryCode}
              onChange={(event) => onCountryChange(event.target.value.toUpperCase())}
            />
          ) : (
            <Combobox
              ariaLabel={searchLabel}
              emptyText={emptyText}
              options={options}
              placeholder={loading ? "…" : searchPlaceholder}
              searchPlaceholder={searchPlaceholder}
              value={countryCode}
              onValueChange={onCountryChange}
            />
          )}
        </div>

        <div className={styles.phoneNumber}>
          <span className={styles.callingCode} aria-hidden="true">
            {selected?.callingCode ?? ""}
          </span>
          <Input
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder={selected?.example ?? ""}
            {...register}
          />
        </div>
      </div>

      <span className={styles.fieldHint}>{help}</span>
      {error ? <span className={styles.fieldError}>{error}</span> : null}
    </div>
  );
}
