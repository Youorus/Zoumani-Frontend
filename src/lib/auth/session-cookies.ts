/**
 * Noms des cookies de session.
 *
 * Volontairement **hors** de `session.server.ts` : ce dernier est marqué
 * `server-only`, ce qui est juste pour les fonctions qui lisent et écrivent
 * les jetons, mais faux pour de simples constantes.
 *
 * `proxy.ts` s'exécute dans le runtime de proxy, avant le rendu, et n'a
 * besoin que de savoir **si** un cookie existe — jamais de son contenu. L'y
 * faire importer un module `server-only` faisait échouer sa compilation en
 * test, et le couplait sans raison au reste.
 */

/** Cookie du jeton d'accès. Court : quinze minutes. */
export const ACCESS_COOKIE = "zoumani_at";

/** Cookie du jeton de rafraîchissement. Long : trente jours glissants. */
export const REFRESH_COOKIE = "zoumani_rt";

export const SESSION_COOKIES = {
  access: ACCESS_COOKIE,
  refresh: REFRESH_COOKIE,
} as const;
