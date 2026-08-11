import "server-only";

import {
  clearSessionCookies,
  readAccessToken,
  readRefreshToken,
  setSessionCookies,
  type IssuedTokens,
} from "@/lib/auth/session.server";

/**
 * Le pont entre le BFF et l'API — le seul endroit qui parle à FastAPI.
 *
 * ═══ Ce que le navigateur ne fait jamais ═══
 *
 * Il n'appelle pas l'API directement. Il appelle des routes de **même
 * origine**, qui ajoutent le jeton lu dans un cookie `httpOnly`. Trois
 * conséquences :
 *
 * 1. aucune configuration CORS avec identifiants — donc aucune liste
 *    d'origines à tenir exacte sous peine d'ouvrir le domaine ;
 * 2. le jeton reste hors de portée du JavaScript de page ;
 * 3. le rafraîchissement est **invisible** : c'est ici qu'il a lieu, pas
 *    dans un intercepteur côté client que chaque onglet exécuterait en
 *    parallèle.
 *
 * ═══ Le rafraîchissement silencieux ═══
 *
 * Un 401 de l'API ne remonte pas tel quel : on tente **une** rotation, on
 * rejoue la requête, et on ne renonce qu'ensuite. C'est ce qui fait qu'une
 * personne connectée hier retrouve son écran sans rien ressaisir.
 *
 * Une seule tentative, jamais deux : si le jeton fraîchement émis est
 * refusé, insister ne ferait que boucler.
 */

/**
 * URL de l'API, côté serveur uniquement. Jamais exposée au navigateur.
 *
 * ═══ Pourquoi le défaut ne vaut qu'en développement ═══
 *
 * `http://localhost:8000` est commode sur un poste, et catastrophique en
 * production : le conteneur appellerait **lui-même**, chaque requête
 * échouerait sur un refus de connexion, et rien dans les journaux ne
 * dirait que la variable manquait — on chercherait le réseau, le pare-feu,
 * l'API, tout sauf une ligne oubliée dans la configuration du conteneur.
 *
 * On préfère donc échouer au premier appel, avec le nom de la variable.
 */
function apiBaseUrl(): string {
  const url = process.env.API_URL;

  if (!url) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "API_URL n'est pas définie. Le relais ne sait pas où appeler l'API : " +
          "posez-la comme variable d'environnement du conteneur, par exemple " +
          "API_URL=https://api.zoumani.fr/api/v1",
      );
    }
    return "http://localhost:8000/api/v1";
  }

  return url.replace(/\/$/, "");
}

/** Réponse de l'API, telle que le BFF la manipule. */
export interface UpstreamResult {
  status: number;
  body: unknown;
  /** Vrai si la session a été rafraîchie pendant l'appel. */
  refreshed: boolean;
  /**
   * `Cache-Control` rendu par l'API, quand elle en pose un.
   *
   * Retransmis tel quel au navigateur. **L'API décide seule** de ce qui
   * est cachable : elle est la seule à savoir si une réponse est
   * personnelle. Un `public` posé sur une route personnalisée serait un
   * défaut de l'API, et c'est là qu'il se corrigerait — le reproduire ici
   * créerait une seconde règle, et deux règles finissent par diverger.
   */
  cacheControl: string | null;
}

interface CallOptions {
  method?: string;
  path: string;
  body?: unknown;
  /** En-têtes à transmettre — jamais `authorization`, posé ici. */
  headers?: Record<string, string>;
  /** Corps binaire, pour les envois de fichiers. */
  raw?: BodyInit;
  contentType?: string;
}

async function rawCall(options: CallOptions, token: string | null): Promise<Response> {
  const headers: Record<string, string> = { ...options.headers };
  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  let body: BodyInit | undefined;
  if (options.raw !== undefined) {
    body = options.raw;
    if (options.contentType) {
      headers["content-type"] = options.contentType;
    }
  } else if (options.body !== undefined) {
    body = JSON.stringify(options.body);
    headers["content-type"] = "application/json";
  }

  return fetch(`${apiBaseUrl()}${options.path}`, {
    method: options.method ?? "GET",
    headers,
    body,
    // Le BFF ne met rien en cache : une réponse authentifiée mise en cache
    // serait servie à la personne suivante.
    cache: "no-store",
  });
}

async function parse(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

/**
 * Échange le jeton de rafraîchissement contre un couple neuf.
 *
 * Rend `false` si la session est définitivement finie — jeton inconnu,
 * expiré, ou révoqué parce qu'un rejeu a été détecté. Les cookies sont
 * alors effacés : les garder ferait retenter le rafraîchissement à chaque
 * requête, indéfiniment.
 */
export async function refreshSession(): Promise<boolean> {
  const refreshToken = await readRefreshToken();
  if (!refreshToken) {
    return false;
  }

  const response = await rawCall(
    { method: "POST", path: "/auth/refresh", body: { refresh_token: refreshToken } },
    null,
  );

  if (!response.ok) {
    await clearSessionCookies();
    return false;
  }

  await setSessionCookies((await response.json()) as IssuedTokens);
  return true;
}

/**
 * Appelle l'API au nom de la personne connectée, en rafraîchissant si besoin.
 */
export async function callApi(options: CallOptions): Promise<UpstreamResult> {
  const first = await rawCall(options, await readAccessToken());

  if (first.status !== 401) {
    return {
      status: first.status,
      body: await parse(first),
      refreshed: false,
      cacheControl: first.headers.get("cache-control"),
    };
  }

  // Le jeton d'accès a expiré — le cas nominal après quinze minutes.
  if (!(await refreshSession())) {
    return { status: 401, body: await parse(first), refreshed: false, cacheControl: null };
  }

  const second = await rawCall(options, await readAccessToken());
  return {
    status: second.status,
    body: await parse(second),
    refreshed: true,
    cacheControl: second.headers.get("cache-control"),
  };
}

/**
 * Appelle l'API **sans** session : connexion, demande de code, sondes.
 *
 * Séparé de `callApi` à dessein : ces routes ne doivent jamais déclencher
 * un rafraîchissement, sous peine de transformer un mot de passe faux en
 * tentative de rotation.
 */
export async function callPublicApi(options: CallOptions): Promise<UpstreamResult> {
  const response = await rawCall(options, null);
  return {
    status: response.status,
    body: await parse(response),
    refreshed: false,
    cacheControl: response.headers.get("cache-control"),
  };
}
