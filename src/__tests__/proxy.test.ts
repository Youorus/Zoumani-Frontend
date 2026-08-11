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
