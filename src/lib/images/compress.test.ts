import { describe, expect, it } from "vitest";

import { fitWithin, MAX_DIMENSION } from "./compress";

/**
 * La mise à l'échelle, éprouvée seule.
 *
 * La compression elle-même dépend du canvas, absent de l'environnement
 * de test. Ce qui se teste ici est la seule décision qu'elle prend :
 * quelles dimensions retenir — et c'est elle qui décide du poids final.
 */
describe("la mise à l'échelle d'une image", () => {
  it("laisse intacte une image déjà sous le plafond", () => {
    expect(fitWithin(800, 600, MAX_DIMENSION)).toEqual({ width: 800, height: 600 });
  });

  it("ramène le grand côté au plafond", () => {
    expect(fitWithin(4000, 3000, 1600)).toEqual({ width: 1600, height: 1200 });
  });

  it("garde les proportions d'un portrait", () => {
    // Une photo de téléphone est verticale neuf fois sur dix : inverser
    // les côtés produirait des images écrasées.
    expect(fitWithin(3000, 4000, 1600)).toEqual({ width: 1200, height: 1600 });
  });

  it("traite un carré sans le déformer", () => {
    expect(fitWithin(2400, 2400, 1600)).toEqual({ width: 1600, height: 1600 });
  });

  it("n'agrandit jamais une petite image", () => {
    // Agrandir n'ajoute aucune information et alourdit le fichier.
    expect(fitWithin(320, 240, 1600)).toEqual({ width: 320, height: 240 });
  });
});
