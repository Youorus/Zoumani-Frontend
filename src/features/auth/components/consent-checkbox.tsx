"use client";

import { useId } from "react";
import { Controller, type Control } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";

import type { RegistrationInput } from "../schemas/auth.schema";
import styles from "./auth-view.module.css";

/**
 * Une case de consentement.
 *
 * ═══ Pourquoi `Controller` et non `register` ═══
 *
 * `Checkbox` est un composant Radix : il rend un `<button role="checkbox">`,
 * pas un `<input>`. Un bouton n'émet jamais d'événement `change`, donc le
 * `onChange` que `register` lui pose n'est **jamais appelé** : la valeur
 * restait indéfinie, la validation échouait, et le formulaire refusait de
 * partir sans que rien ne bouge à l'écran — la case était cochée, et le
 * message d'erreur restait.
 *
 * `Controller` fait le pont dans les deux sens : il donne la valeur au
 * composant et récupère `onCheckedChange`.
 *
 * ═══ Pourquoi le texte n'est pas un `<label htmlFor>` ═══
 *
 * `htmlFor` ne désigne que des éléments étiquetables, ce qu'un `<button>`
 * n'est pas. Le clic sur le texte ne ferait donc rien du tout. On le
 * gère explicitement, et le lien avec la case est rétabli par
 * `aria-labelledby` — qui, lui, accepte n'importe quel élément.
 */
export function ConsentCheckbox({
  control,
  name,
  label,
}: {
  control: Control<RegistrationInput>;
  name: "acceptsTerms" | "acceptsPrivacyPolicy";
  label: string;
}) {
  const textId = useId();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const checked = field.value === true;
        return (
          <div className={styles.consent}>
            <Checkbox
              checked={checked}
              onCheckedChange={(next) => field.onChange(next === true)}
              onBlur={field.onBlur}
              aria-labelledby={textId}
            />
            <span
              id={textId}
              className={styles.consentText}
              onClick={() => field.onChange(!checked)}
            >
              {label}
            </span>
          </div>
        );
      }}
    />
  );
}
