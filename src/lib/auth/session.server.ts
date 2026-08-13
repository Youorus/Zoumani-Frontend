import "server-only";

import { cookies } from "next/headers";

import { ACCESS_COOKIE, REFRESH_COOKIE } from "./session-cookies";

/**
 * Les cookies de session, et la seule façon d'y toucher.
 *
 * ═══ Pourquoi `server-only` ═══
 *
 * L'import en tête de fichier fait **échouer la compilation** si un
 * composant client importe ce module par mégarde. C'est le garde-fou qui
 * empêche un jeton de fuir vers le navigateur — un commentaire ne
 * l'empêcherait pas, une erreur de build si.
 *
 * ═══ Pourquoi `httpOnly` ═══
 *
 * Un cookie `httpOnly` est invisible du JavaScript de la page. Une faille
 * XSS — y compris dans une dépendance npm compromise — ne peut donc pas
 * lire la session. `localStorage`, lui, est lisible par n'importe quel
 * script : c'est la raison pour laquelle l'ADR-0010 l'a écarté.
 *
 * ═══ Pourquoi `sameSite: lax` et non `strict` ═══
 *
 * `strict` n'envoie aucun cookie lorsqu'on arrive depuis un lien externe :
 * quelqu'un qui clique sur un lien reçu par message atterrirait déconnecté
 * sur une plateforme où il l'est. `lax` envoie le cookie sur les
 * navigations de premier niveau et le retient sur les requêtes croisées —
 * ce qui bloque le CSRF sans casser les liens entrants.
 */

/**
 * Contenu d'une session émise par l'API.
 *
 * En `snake_case` : c'est exactement ce que rend l'API, et le convertir
 * ici n'apporterait rien puisque ces valeurs ne quittent jamais le serveur.
 */
export interface IssuedTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
}

function secure(): boolean {
  // En développement, le navigateur refuse un cookie `Secure` sur http://,
  // et la session ne s'établirait jamais. En production, l'omettre
  // laisserait le cookie voyager en clair sur un réseau hostile.
  return process.env.NODE_ENV === "production";
}

/** Pose les deux cookies de session sur la réponse en cours. */
export async function setSessionCookies(tokens: IssuedTokens): Promise<void> {
  const store = await cookies();
  const common = {
    httpOnly: true,
    secure: secure(),
    sameSite: "lax" as const,
    path: "/",
  };

  store.set(ACCESS_COOKIE, tokens.access_token, {
    ...common,
    maxAge: tokens.expires_in,
  });
  store.set(REFRESH_COOKIE, tokens.refresh_token, {
    ...common,
    maxAge: tokens.refresh_expires_in,
  });
}

/** Efface les cookies de session. */
export async function clearSessionCookies(): Promise<void> {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

/** Jeton d'accès courant, ou `null`. */
export async function readAccessToken(): Promise<string | null> {
  return (await cookies()).get(ACCESS_COOKIE)?.value ?? null;
}

/** Jeton de rafraîchissement courant, ou `null`. */
export async function readRefreshToken(): Promise<string | null> {
  return (await cookies()).get(REFRESH_COOKIE)?.value ?? null;
}

/**
 * Y a-t-il une session à tenter de restaurer ?
 *
 * Le jeton d'accès peut avoir expiré sans que la session soit finie — c'est
 * même le cas nominal après quinze minutes d'inactivité. Seule la présence
 * du jeton de rafraîchissement dit qu'il vaut la peine d'essayer.
 */
export async function hasRestorableSession(): Promise<boolean> {
  return (await readRefreshToken()) !== null;
}

export { SESSION_COOKIES } from "./session-cookies";
