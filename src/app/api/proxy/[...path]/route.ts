import { NextResponse } from "next/server";

import { callApi } from "@/lib/api/upstream.server";

/**
 * Le passe-plat authentifié : toute requête métier passe par ici.
 *
 * ═══ Ce que cette route apporte ═══
 *
 * Le navigateur appelle `/api/proxy/trips` ; cette route ajoute le jeton lu
 * dans un cookie `httpOnly` et appelle `GET /api/v1/trips`. Le jeton ne
 * touche jamais le JavaScript de page.
 *
 * Elle apporte aussi le **rafraîchissement silencieux** : si l'API répond
 * 401 parce que le jeton d'accès a expiré, `callApi` fait tourner la
 * session et rejoue la requête. Le composant qui appelait ne voit qu'une
 * réponse réussie, et la personne n'a rien ressaisi.
 *
 * ═══ Ce qu'elle ne fait pas ═══
 *
 * Elle ne filtre pas, ne réécrit pas, n'interprète pas. L'autorisation
 * reste **entièrement** du ressort de l'API : un passe-plat qui déciderait
 * lui-même deviendrait une seconde implémentation des règles, et les deux
 * divergeraient. Ici, il ajoute un en-tête, rien de plus.
 */

/** Méthodes acceptées. Le reste n'a aucune raison d'exister sur cette API. */
type Handler = (
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) => Promise<NextResponse>;

/** En-têtes du client qu'il est utile de transmettre à l'API. */
const FORWARDED_HEADERS = ["accept-language", "user-agent"] as const;

function collectHeaders(request: Request): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const name of FORWARDED_HEADERS) {
    const value = request.headers.get(name);
    if (value) {
      headers[name] = value;
    }
  }
  return headers;
}

function forward(method: string): Handler {
  return async (request, context) => {
    // `params` est asynchrone depuis Next 15 : l'oublier rend un objet
    // vide, et toutes les requêtes partiraient vers la racine de l'API.
    const { path } = await context.params;
    const search = new URL(request.url).search;
    const target = `/${path.join("/")}${search}`;

    const contentType = request.headers.get("content-type") ?? "";
    const headers = collectHeaders(request);

    // Un envoi de fichier arrive en multipart : le relire en JSON
    // corromprait les octets. On retransmet le corps tel quel.
    const isMultipart = contentType.startsWith("multipart/form-data");
    const hasBody = method !== "GET" && method !== "DELETE";

    const result = await callApi({
      method,
      path: target,
      headers,
      ...(hasBody && isMultipart
        ? { raw: await request.arrayBuffer(), contentType }
        : {}),
      ...(hasBody && !isMultipart ? { body: await safeJson(request) } : {}),
    });

    // Ce que l'API a dit de la fraîcheur de sa réponse la suit jusqu'au
    // navigateur. Sans cela, un référentiel déclaré valable vingt-quatre
    // heures serait redemandé à chaque affichage du formulaire.
    const responseHeaders = result.cacheControl
      ? { "cache-control": result.cacheControl }
      : undefined;

    if (result.body === null) {
      return new NextResponse(null, { status: result.status, headers: responseHeaders });
    }
    return NextResponse.json(result.body, {
      status: result.status,
      headers: responseHeaders,
    });
  };
}

async function safeJson(request: Request): Promise<unknown> {
  const text = await request.text();
  if (!text) {
    return undefined;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return undefined;
  }
}

export const GET = forward("GET");
export const POST = forward("POST");
export const PUT = forward("PUT");
export const PATCH = forward("PATCH");
export const DELETE = forward("DELETE");
