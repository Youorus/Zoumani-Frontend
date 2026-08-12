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

/**
 * Préfixes exigeant une session. Tout le reste est public.
 *
 * ⚠️ Ce sont des **URL**, pas des dossiers. Un groupe de routes — le
 * `(app)` de `src/app/(app)/trips` — n'apparaît jamais dans l'adresse :
 * cette page-là se sert à `/trips`. Protéger `/app` ne protégeait donc
 * rien du tout, et c'est exactement le genre d'erreur qui ne se voit pas :
 * la liste a l'air complète, et toutes les pages restent ouvertes.
 */
const PROTECTED_PREFIXES = ["/compte", "/trips", "/admin"] as const;

/** Où l'on envoie quelqu'un qui n'est pas connecté. */
const LOGIN_PATH = "/connexion";

/** Où atterrit quelqu'un de déjà connecté qui rouvre la porte d'entrée. */
const HOME_AFTER_LOGIN = "/compte";

export function proxy(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;
  const aUneSession = request.cookies.has(SESSION_COOKIES.refresh);

  /*
   * Une personne déjà connectée n'a rien à faire sur l'écran de
   * connexion. Elle y arrive par un signet, par le bouton du navigateur,
   * ou en tapant l'adresse — et se retrouve devant un formulaire qui lui
   * redemande ce qu'elle a déjà donné.
   *
   * On la renvoie donc à sa destination : celle qu'elle visait si elle
   * en avait une, son espace sinon. Elle ne voit jamais le formulaire.
   *
   * Ici encore, c'est la **présence** du cookie qui décide, pas sa
   * validité : le vérifier coûterait un aller-retour réseau sur chaque
   * navigation. Un cookie périmé mène à l'espace, l'API répond 401, et
   * la page renvoie vers la connexion — un détour d'une seconde, contre
   * un appel systématique pour tout le monde.
   */
  /*
   * L'accueil public n'a rien à dire à quelqu'un de connecté.
   *
   * Il vend la plateforme à qui ne la connaît pas : promesse, garanties,
   * « comment ça marche ». Quelqu'un qui a déjà un compte y arrive par
   * son signet ou par le logo, et doit ensuite chercher son espace. On
   * l'y emmène directement.
   *
   * Le renvoi ne vaut que pour la racine exacte : les ancres de la page
   * — aide, conditions — restent atteignables, et c'est vers elles que
   * pointe le pied de page de l'espace.
   */
  if (aUneSession && pathname === "/") {
    return NextResponse.redirect(new URL(HOME_AFTER_LOGIN, request.url));
  }

  if (aUneSession && pathname === LOGIN_PATH) {
    const voulue = request.nextUrl.searchParams.get("suite");
    const destination = new URL(
      voulue?.startsWith("/") && !voulue.startsWith("//") ? voulue : HOME_AFTER_LOGIN,
      request.url,
    );
    return NextResponse.redirect(destination);
  }

  const needsSession = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (!needsSession) {
    return NextResponse.next();
  }

  if (aUneSession) {
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
