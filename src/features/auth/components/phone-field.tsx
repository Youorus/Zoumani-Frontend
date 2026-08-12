"use client";

import { useEffect } from "react";

import { Input } from "@/components/ui/input";

import { usePhoneCountries } from "../hooks/use-phone-countries";
import { CountrySelect } from "./country-select";
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
  // Le même référentiel que `CountrySelect`, servi depuis le cache du
  // navigateur : il porte un `Cache-Control` de vingt-quatre heures.
  // On en a besoin ici pour deux choses que le sélecteur ne rend pas —
  // l'indicatif affiché à côté du numéro, et l'exemple de saisie.
  const { countries, suggested } = usePhoneCountries(language, "CM");

  // La devinette ne s'applique qu'une fois, et seulement si la personne
  // n'a rien choisi : écraser une sélection manuelle parce que la liste
  // vient d'arriver serait insupportable.
  useEffect(() => {
    if (suggested && !countryCode) {
      onCountryChange(suggested);
    }
  }, [suggested, countryCode, onCountryChange]);

  const selected = countries.find((country) => country.code === countryCode);

  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>

      <div className={styles.phoneRow}>
        <div className={styles.phoneCountry}>
          <CountrySelect
            language={language}
            value={countryCode}
            onChange={onCountryChange}
            ariaLabel={searchLabel}
            placeholder={searchPlaceholder}
            emptyText={emptyText}
            showCallingCode
          />
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
