import { describe, expect, it } from "vitest";

import { homeContent } from "../home-content";

/**
 * Le dictionnaire bilingue de la page d'accueil.
 *
 * ═══ Ce que ces tests attrapent ═══
 *
 * Le défaut propre aux dictionnaires à deux langues : on ajoute une clé
 * d'un côté et on oublie l'autre. TypeScript ne le voit pas — les deux
 * entrées ont le même type, et une valeur oubliée est simplement absente
 * à l'exécution. Le texte disparaît alors uniquement pour ceux qui ont
 * basculé en anglais, c'est-à-dire pour personne pendant le
 * développement.
 *
 * Le second test porte sur `{accent}` : c'est un marqueur, pas du texte.
 * `Hero` coupe la description dessus pour mettre un fragment en gras. S'il
 * disparaît d'une traduction, la phrase s'affiche entière sans gras — ou
 * pire, avec le marqueur visible.
 */

/** Toutes les clés d'un objet, chemins imbriqués compris. */
function chemins(valeur: unknown, prefixe = ""): string[] {
  if (Array.isArray(valeur)) {
    return valeur.flatMap((v, i) => chemins(v, `${prefixe}[${i}]`));
  }
  if (valeur !== null && typeof valeur === "object") {
    return Object.entries(valeur).flatMap(([cle, v]) =>
      chemins(v, prefixe ? `${prefixe}.${cle}` : cle),
    );
  }
  return [prefixe];
}

describe("le dictionnaire de la page d'accueil", () => {
  it("porte exactement les mêmes clés en français et en anglais", () => {
    const fr = chemins(homeContent.fr).sort();
    const en = chemins(homeContent.en).sort();

    expect(en).toEqual(fr);
  });

  it("n'a aucune valeur vide", () => {
    const vides: string[] = [];
    const parcourir = (valeur: unknown, chemin = "") => {
      if (Array.isArray(valeur)) {
        valeur.forEach((v, i) => parcourir(v, `${chemin}[${i}]`));
      } else if (valeur !== null && typeof valeur === "object") {
        Object.entries(valeur).forEach(([k, v]) =>
          parcourir(v, chemin ? `${chemin}.${k}` : k),
        );
      } else if (typeof valeur === "string" && valeur.trim() === "") {
        vides.push(chemin);
      }
    };
    parcourir(homeContent);

    expect(vides).toEqual([]);
  });

  it("garde le marqueur {accent} dans les deux descriptions du hero", () => {
    // `Hero` coupe dessus pour mettre un fragment en gras. Sans marqueur,
    // le fragment ne se détacherait plus ; avec un marqueur mal orthographié,
    // il s'afficherait tel quel au milieu de la phrase.
    for (const langue of ["fr", "en"] as const) {
      expect(homeContent[langue].hero.description).toContain("{accent}");
      expect(homeContent[langue].hero.description.split("{accent}")).toHaveLength(2);
    }
  });

  it("propose trois garanties et trois étapes, dans les deux langues", () => {
    // Le hero les dispose en grille de trois colonnes et associe un
    // pictogramme à chacune par son rang. Un quatrième élément sortirait
    // de la grille sans pictogramme.
    for (const langue of ["fr", "en"] as const) {
      expect(homeContent[langue].hero.trust).toHaveLength(3);
      expect(homeContent[langue].hero.phone.steps).toHaveLength(3);
    }
  });
});
