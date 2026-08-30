import { describe, expect, it } from "vitest";

import { MAX_SUGGESTIONS, searchCities } from "../city-search";

/**
 * Ce que ces tests protègent :
 *
 * 1. **on trouve sans savoir écrire** — accents, casse, apostrophes : sur
 *    un clavier de téléphone, personne ne compose « Côte d’Ivoire » ;
 * 2. **le début prime** — « dou » doit donner Douala en premier, sinon la
 *    complétion paraît ne pas comprendre ;
 * 3. **la liste reste courte** — assez pour choisir, trop peu pour lire.
 */

describe("la recherche de ville", () => {
  it("trouve les villes du corridor", () => {
    expect(searchCities("douala")[0].city).toBe("Douala");
    expect(searchCities("paris")[0].city).toBe("Paris");
    expect(searchCities("dakar")[0].city).toBe("Dakar");
  });

  it("ignore la casse et les accents", () => {
    // Personne ne tape « Yaoundé » avec son accent sur un téléphone.
    expect(searchCities("yaounde")[0].city).toBe("Yaoundé");
    expect(searchCities("YAOUNDE")[0].city).toBe("Yaoundé");
  });

  it("place ce qui commence par la saisie avant ce qui la contient", () => {
    const resultats = searchCities("dou");
    expect(resultats[0].city).toBe("Douala");
  });

  it("affiche le pays en toutes lettres", () => {
    expect(searchCities("douala")[0].label).toBe("Douala, Cameroun");
  });

  it("ne répond pas à une lettre isolée", () => {
    // Une seule lettre rendrait des dizaines de villes : du bruit.
    expect(searchCities("d")).toEqual([]);
    expect(searchCities("")).toEqual([]);
  });

  it("borne la liste", () => {
    expect(searchCities("a").length).toBeLessThanOrEqual(MAX_SUGGESTIONS);
    expect(searchCities("san").length).toBeLessThanOrEqual(MAX_SUGGESTIONS);
  });

  it("ne trouve rien pour une saisie qui n'existe pas", () => {
    expect(searchCities("zzzzzz")).toEqual([]);
  });

  it("rend le code pays, pour que le corridor reste structuré", () => {
    expect(searchCities("douala")[0].countryCode).toBe("CM");
    expect(searchCities("bruxelles")[0]?.countryCode ?? searchCities("zaventem")[0]?.countryCode).toBe("BE");
  });
});
