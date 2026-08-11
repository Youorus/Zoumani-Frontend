import type { AuthError } from "@/lib/auth/auth-client";

import type { RegistrationInput } from "../schemas/auth.schema";

/**
 * Où poser une erreur venue du serveur.
 *
 * ═══ Pourquoi ça compte ═══
 *
 * « Un compte utilise déjà ce numéro de téléphone » affiché en bandeau
 * tout en haut oblige à relire le formulaire pour deviner de quoi il
 * parle. Sous le champ concerné, il n'y a plus rien à deviner : le regard
 * est déjà là, et la correction se fait dans la foulée. C'est la
 * différence entre un formulaire qui refuse et un formulaire qui aide.
 *
 * ═══ Pourquoi la table est ici et non côté serveur ═══
 *
 * L'API nomme ses champs dans **sa** convention — `phone_national_number`.
 * Elle n'a pas à connaître le nom que le formulaire leur donne, ni même
 * qu'il existe un formulaire : demain, une application mobile aura ses
 * propres noms. La correspondance appartient donc au client, et à lui
 * seul.
 *
 * Ce qui ne correspond à aucun champ retombe sur le bandeau — c'est le
 * cas d'un parcours périmé, qui ne se corrige nulle part dans la page.
 */

/** Champs du formulaire d'inscription, par leur nom côté API. */
const REGISTRATION_FIELDS: Record<string, keyof RegistrationInput> = {
  first_name: "firstName",
  last_name: "lastName",
  phone_country_code: "phoneCountryCode",
  phone_national_number: "phoneNationalNumber",
  // L'unicité porte sur le numéro canonique, que le formulaire ne saisit
  // pas : il est composé du pays et du numéro national. On désigne le
  // second — c'est celui qu'il faut changer, le pays étant rarement en
  // cause quand un compte existe déjà.
  phone_number: "phoneNationalNumber",
  accepts_terms: "acceptsTerms",
  accepts_privacy_policy: "acceptsPrivacyPolicy",
};

export interface ServerFieldError {
  field: keyof RegistrationInput;
  message: string;
}

/**
 * Traduit une erreur du serveur en erreur de champ, si elle en désigne un.
 *
 * Rend `null` quand rien ne correspond : l'appelant garde alors le
 * bandeau, plutôt que d'avaler un message qui n'aurait nulle part où
 * s'afficher.
 */
export function registrationFieldError(
  error: AuthError | null,
): ServerFieldError | null {
  if (!error?.field) {
    return null;
  }
  const field = REGISTRATION_FIELDS[error.field];
  return field ? { field, message: error.message } : null;
}
