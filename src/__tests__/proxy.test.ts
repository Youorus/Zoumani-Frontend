import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { config, proxy } from "../proxy";

function requestFor(path: string, withSession: boolean): NextRequest {
  const request = new NextRequest(new URL(`http://localhost:3000${path}`));
  if (withSession) {
    request.cookies.set("zoumani_rt", "un-jeton-quelconque");
  }
  return request;
}

describe("protection des routes", () => {
  it("laisse passer les pages publiques", () => {
    const response = proxy(requestFor("/", false));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("redirige une route protégée sans session", () => {
    const response = proxy(requestFor("/compte", false));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/connexion");
  });

  it("conserve la destination voulue", () => {
    // Après connexion, la personne reprend là où elle allait plutôt que
    // sur un accueil générique.
    const response = proxy(requestFor("/trips?filtre=actifs", false));
    const location = response.headers.get("location") ?? "";

    expect(location).toContain("suite=");
    expect(decodeURIComponent(location)).toContain("/trips?filtre=actifs");
  });

  it("laisse passer une route protégée avec session", () => {
    const response = proxy(requestFor("/compte", true));

    expect(response.headers.get("location")).toBeNull();
  });

  it("protège aussi l'administration", () => {
    expect(proxy(requestFor("/admin", false)).status).toBe(307);
  });

  it("ne confond pas un préfixe avec un mot plus long", () => {
    // `/comptes-rendus` n'est pas `/compte` : sans la vérification du
    // séparateur, une page publique se retrouverait derrière la connexion.
    const response = proxy(requestFor("/comptes-rendus", false));

    expect(response.headers.get("location")).toBeNull();
  });

  it("protège les pages du groupe applicatif, servies sans son nom", () => {
    // Le test qui a manqué. Un groupe de routes — le `(app)` de
    // `src/app/(app)/trips` — n'apparaît **pas** dans l'URL : cette page
    // se sert à `/trips`. La liste protégeait `/app`, donc rien, et rien
    // ne le signalait.
    expect(proxy(requestFor("/trips", false)).status).toBe(307);
    expect(proxy(requestFor("/trips/abc", false)).status).toBe(307);
  });
});

describe("champ d'application", () => {
  it("exclut les fichiers statiques et les routes du BFF", () => {
    // Sans cette exclusion, la redirection bloquerait le CSS et le
    // JavaScript de la page de connexion elle-même — et casserait les
    // appels `fetch`, qui recevraient du HTML.
    // Next ancre ses matchers : sans `^…$`, la regex trouverait une
    // correspondance en milieu de chemin et le test mentirait.
    const pattern = new RegExp(`^${config.matcher[0]}$`);

    expect(pattern.test("/api/auth/session")).toBe(false);
    expect(pattern.test("/_next/static/chunk.js")).toBe(false);
    expect(pattern.test("/logo.png")).toBe(false);
    expect(pattern.test("/compte")).toBe(true);
  });
});

describe("la porte d'entrée pour qui est déjà entré", () => {
  it("renvoie vers son espace au lieu du formulaire", () => {
    // Quelqu'un arrive par un signet ou le bouton retour. Lui
    // redemander ce qu'il a déjà donné n'a aucun sens.
    const response = proxy(requestFor("/connexion", true));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/compte");
  });

  it("respecte la destination voulue plutôt que l'espace par défaut", () => {
    // Le cas du lien profond : on cliquait sur un voyage, la connexion
    // s'est intercalée, on veut retrouver ce voyage — pas un accueil.
    const response = proxy(requestFor("/connexion?suite=%2Ftrips%2Fabc", true));

    expect(decodeURIComponent(response.headers.get("location") ?? "")).toContain(
      "/trips/abc",
    );
  });

  it("refuse une destination qui sort du site", () => {
    // Une redirection ouverte transformerait la page de connexion en
    // tremplin d'hameçonnage : le lien serait légitime jusqu'au dernier
    // saut.
    const response = proxy(requestFor("/connexion?suite=https%3A%2F%2Failleurs.fr", true));

    expect(response.headers.get("location")).toContain("/compte");
    expect(response.headers.get("location")).not.toContain("ailleurs.fr");
  });

  it("laisse le formulaire à qui n'a pas de session", () => {
    const response = proxy(requestFor("/connexion", false));

    expect(response.headers.get("location")).toBeNull();
  });
});

describe("l'accueil public, pour qui est déjà connecté", () => {
  it("mène directement à son espace", () => {
    // L'accueil vend la plateforme à qui ne la connaît pas. Quelqu'un
    // qui a un compte n'a rien à y lire, et devrait ensuite chercher son
    // espace.
    const response = proxy(requestFor("/", true));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/compte");
  });

  it("laisse l'accueil aux visiteurs", () => {
    expect(proxy(requestFor("/", false)).headers.get("location")).toBeNull();
  });

  it("n'intercepte que la racine exacte", () => {
    // Les ancres de l'accueil — aide, conditions — restent atteignables :
    // c'est vers elles que pointe le pied de page de l'espace.
    expect(proxy(requestFor("/search", true)).headers.get("location")).toBeNull();
  });
});
