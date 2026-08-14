/**
 * Le parcours de connexion, tel que le backend le décrit.
 *
 * ═══ Une seule porte pour se connecter ET s'inscrire ═══
 *
 * On ne demande jamais « avez-vous déjà un compte ? ». La personne saisit
 * son adresse ; le serveur sait. Si un compte existe, elle se connecte ;
 * sinon, on lui demande ce qui manque et le compte se crée à la volée.
 *
 * La divergence n'a lieu qu'**après** le code reçu par mail — donc après
 * avoir prouvé qu'on relève cette boîte. C'est ce qui permet d'unifier les
 * deux parcours sans transformer la page en annuaire des inscrits.
 *
 * ═══ Aucun rôle, aucun mot de passe ═══
 *
 * Pas de choix « expéditeur ou voyageur » : le rôle n'est pas un attribut
 * de la personne mais une position dans une transaction (AGENTS.md §9).
 * La même personne expédie lundi et voyage jeudi, avec le même compte.
 *
 * Pas de mot de passe non plus : deux preuves de possession — la boîte
 * mail, le téléphone — suffisent, et il n'y a rien à mémoriser ni à
 * perdre.
 *
 * ═══ La preuve du téléphone est levée en ce moment ═══
 *
 * Le serveur le décide, pas nous. Une étape peut donc **clore** le parcours
 * en répondant `completed` avec une session, au lieu de renvoyer vers
 * l'écran du SMS.
 *
 * Rien ici ne teste un drapeau : l'interface suit `step`. C'est ce qui lui
 * permet de fonctionner à une barrière comme à deux, et de survivre au
 * rétablissement sans une ligne de changement.
 */

/** Où en est le parcours, selon le serveur. */
export type LoginStepName =
  "email_pending" | "registration_pending" | "phone_pending" | "completed";

/** Réponse du serveur à chaque étape. */
export interface LoginStep {
  challengeId: string;
  step: LoginStepName;
  /** Destination masquée : `a•••@example.com`, `…3456`. */
  sentTo: string | null;
  expiresIn: number;
  /** Champs à recueillir quand `step` vaut `registration_pending`. */
  requiredFields: string[];
  /**
   * Présente quand cette étape a clos le parcours.
   *
   * Elle ne porte **que** les permissions : les jetons se sont arrêtés à la
   * frontière du serveur, où ils sont devenus des cookies `httpOnly`.
   */
  session?: { permissions: string[] };
}

/** Écran affiché à un instant donné. */
export type AuthScreen = "email" | "email-code" | "registration" | "phone-code" | "done";

/**
 * Traduit l'étape du serveur en écran.
 *
 * La correspondance est explicite plutôt que devinée : `email_pending`
 * signifie « un code vient de partir », donc l'écran à montrer est celui
 * de la **saisie** du code, pas celui de l'adresse.
 */
export function screenFor(step: LoginStepName): AuthScreen {
  switch (step) {
    case "email_pending":
      return "email-code";
    case "registration_pending":
      return "registration";
    case "phone_pending":
      return "phone-code";
    case "completed":
      return "done";
  }
}
