import { describe, expect, it } from "vitest";

import { screenFor } from "./auth-flow";

/**
 * La traduction étape → écran.
 *
 * Elle tient en un `switch`, et c'est précisément pourquoi elle se teste :
 * une étape non traitée ne produit aucune erreur visible, elle laisse
 * l'interface sur l'écran précédent. La personne a saisi le bon code, le
 * serveur l'a acceptée, et rien ne bouge.
 */
describe("screenFor", () => {
  it("mène à l'écran d'arrivée quand le serveur clôt le parcours", () => {
    // Le cas d'aujourd'hui : la preuve du téléphone est levée côté API, et
    // l'étape de l'e-mail répond directement `completed`. Sans cette
    // correspondance, la connexion réussissait sans que rien ne change à
    // l'écran — le pire des symptômes, parce qu'il ressemble à une panne.
    expect(screenFor("completed")).toBe("done");
  });

  it("demande le code du SMS quand la seconde barrière est armée", () => {
    // Ce que le rétablissement du second facteur doit faire revenir.
    expect(screenFor("phone_pending")).toBe("phone-code");
  });

  it("demande le code du mail, et non l'adresse, juste après l'envoi", () => {
    // `email_pending` veut dire « un code vient de partir » : renvoyer à la
    // saisie de l'adresse ferait tout recommencer.
    expect(screenFor("email_pending")).toBe("email-code");
  });

  it("demande les informations manquantes à la première venue", () => {
    expect(screenFor("registration_pending")).toBe("registration");
  });
});
