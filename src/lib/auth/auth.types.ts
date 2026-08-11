/**
 * Contrat d'authentification, tel que l'API le rend.
 *
 * Écrit à la main plutôt que généré : ajouter `openapi-typescript` est une
 * dépendance de plus, et ce contrat-ci tient en cinquante lignes. Le jour
 * où l'on génèrera tout le contrat de l'API, ce fichier disparaîtra au
 * profit du schéma — c'est une décision à prendre, pas un oubli.
 *
 * ═══ Pourquoi il n'y a PAS de champ `role` ═══
 *
 * Le backend l'interdit explicitement (AGENTS.md §9) : « le rôle n'est pas
 * un attribut de la personne, c'est une position dans une transaction ».
 * Personne n'« est » voyageur ; quelqu'un est *le voyageur de ce trajet-ci*
 * et *l'expéditeur de cette expédition-là*, avec le même compte.
 *
 * L'interface dérive donc ce qu'elle affiche des **permissions**. Un
 * `role === "admin"` réintroduirait côté client précisément l'erreur que le
 * backend s'interdit — et le jour où quelqu'un ne pourra que *lire* les
 * dossiers sans les valider, il faudrait tout reprendre.
 *
 * ═══ Pourquoi il n'y a PAS de jeton ici ═══
 *
 * Les jetons vivent dans des cookies `httpOnly`, hors de portée du
 * JavaScript. Le navigateur ne les voit jamais. Les faire transiter par un
 * état React les rendrait lisibles par toute dépendance npm compromise.
 */

/** Une permission, sous la forme `<ressource>:<action>`. */
export type Permission = string;

/** La personne connectée, telle que `/auth/me` la rend. */
export interface AuthenticatedUser {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  preferredLanguage: string;
  timezone: string;
  status: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  identityVerified: boolean;
  profilePictureUrl: string | null;
  permissions: Permission[];
}

/**
 * État de la session, du point de vue de l'interface.
 *
 * `loading` existe et compte : au premier rendu, on ne sait pas encore si
 * la personne est connectée. Confondre « je ne sais pas » et « anonyme »
 * fait clignoter l'écran de connexion à chaque rechargement pour quelqu'un
 * qui est parfaitement authentifié.
 */
export type SessionStatus = "loading" | "authenticated" | "anonymous";

export interface SessionSnapshot {
  status: SessionStatus;
  user: AuthenticatedUser | null;
}

/** Parcours de connexion réellement disponibles, annoncés par l'API. */
export interface LoginMethods {
  password: boolean;
  oneTimeCode: boolean;
}

/** Erreur normalisée, telle que l'API la rend. */
export interface ApiErrorPayload {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Forme brute de `/auth/me`, en `snake_case` comme l'API la produit.
 *
 * Isolée de `AuthenticatedUser` pour que la conversion se fasse en **un
 * seul endroit** : sans cela, chaque composant choisirait sa convention et
 * l'on trouverait `identity_verified` ici, `identityVerified` là.
 */
export interface RawCurrentUser {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  preferred_language: string;
  timezone: string;
  status: string;
  email_verified: boolean;
  phone_verified: boolean;
  identity_verified: boolean;
  profile_picture_url: string | null;
  permissions: string[];
}

/** Convertit la réponse de l'API vers la forme utilisée par l'interface. */
export function toAuthenticatedUser(raw: RawCurrentUser): AuthenticatedUser {
  return {
    id: raw.id,
    firstName: raw.first_name,
    lastName: raw.last_name,
    fullName: raw.full_name,
    email: raw.email,
    phone: raw.phone,
    preferredLanguage: raw.preferred_language,
    timezone: raw.timezone,
    status: raw.status,
    emailVerified: raw.email_verified,
    phoneVerified: raw.phone_verified,
    identityVerified: raw.identity_verified,
    profilePictureUrl: raw.profile_picture_url,
    permissions: raw.permissions,
  };
}

/**
 * La personne détient-elle cette permission ?
 *
 * Le contrôle qui compte reste celui de l'API : ceci ne sert qu'à ne pas
 * afficher un bouton qui répondrait 403. Un client malveillant qui
 * s'attribuerait des permissions n'obtiendrait rien de plus.
 */
export function can(user: AuthenticatedUser | null, permission: Permission): boolean {
  return user?.permissions.includes(permission) ?? false;
}

/** La personne détient-elle **au moins une** de ces permissions ? */
export function canAny(user: AuthenticatedUser | null, permissions: Permission[]): boolean {
  return permissions.some((permission) => can(user, permission));
}
