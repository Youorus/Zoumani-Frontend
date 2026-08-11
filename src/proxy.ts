import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { SESSION_COOKIES } from "@/lib/auth/session-cookies";

/**
 * Protection des routes, avant même le premier octet de rendu.
 *
 * ═══ Pourquoi ce fichier s'appelle `proxy.ts` ═══
 *
 * `middleware.ts` est **déprécié depuis Next 16** et renommé `proxy.ts`.
 * Le comportement est identique ; seuls le fichier et l'export changent.
 * Écrire `middleware.ts` produirait du code obsolète dès le premier jour.
 *
 * ═══ Ce qu'il vérifie, et ce qu'il ne vérifie pas ═══
 *
 * Il regarde **la présence** du cookie de rafraîchissement, rien de plus.
 * Il ne le valide pas, et c'est délibéré :
 *
 * - valider exigerait un appel réseau à chaque navigation, y compris pour
 *   des pages qui n'en ont pas besoin ;
 * - la validation qui compte a lieu côté API, à chaque requête, et elle
 *   n'est pas contournable.
 *
 * Ce contrôle-ci ne fait qu'éviter d'afficher une page vide à quelqu'un qui
 * n'est manifestement pas connecté. Quelqu'un qui forgerait un cookie
 * verrait l'écran se charger… et toutes ses requêtes échouer en 401.
 *
 * ═══ Pourquoi le `matcher` est indispensable ═══
 *
 * Sans lui, ce code s'exécute sur **chaque** requête — y compris les
 * fichiers statiques, les images optimisées et le contenu de `public/`.
 * Une redirection d'authentification bloquerait alors le CSS et le
 * JavaScript de la page de connexion elle-même.
 */

/** Préfixes exigeant une session. Tout le reste est public. */
const PROTECTED_PREFIXES = ["/app", "/admin", "/compte"] as const;

/** Où l'on envoie quelqu'un qui n'est pas connecté. */
const LOGIN_PATH = "/connexion";

export function proxy(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;

  const needsSession = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (!needsSession) {
    return NextResponse.next();
  }

  if (request.cookies.has(SESSION_COOKIES.refresh)) {
    return NextResponse.next();
  }

  // La destination voulue est conservée : après connexion, la personne
  // reprend là où elle allait plutôt que sur un accueil générique.
  const destination = new URL(LOGIN_PATH, request.url);
  destination.searchParams.set("suite", `${pathname}${search}`);
  return NextResponse.redirect(destination);
}

export const config = {
  matcher: [
    // Tout sauf les fichiers servis tels quels et les routes du BFF —
    // celles-ci gèrent leur propre authentification et se rediriger
    // vers une page HTML casserait les appels `fetch`.
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
