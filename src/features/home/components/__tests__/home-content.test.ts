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
 * Les tests sur `{accent}` portent sur un marqueur, pas sur du texte. Le
 * hero et la ligne de garantie coupent leur phrase dessus pour mettre un
 * fragment en gras. S'il disparaît d'une traduction, la phrase s'affiche
 * entière sans gras — ou pire, avec le marqueur visible au milieu.
 */

const LANGUES = ["fr", "en"] as const;

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

  it("garde le marqueur {accent} là où une phrase est coupée en deux", () => {
    for (const langue of LANGUES) {
      expect(homeContent[langue].hero.description.split("{accent}")).toHaveLength(
        2,
      );
    }
  });

  it("donne deux parcours de trois étapes à « Comment ça marche »", () => {
    // Les étapes sont posées sur un rail à trois colonnes, et les deux
    // onglets doivent décrire le même nombre d'étapes : sinon le panneau
    // change de hauteur en basculant, et la page saute sous le curseur.
    for (const langue of LANGUES) {
      const onglets = homeContent[langue].howItWorks.tabs;
      expect(onglets).toHaveLength(2);
      for (const onglet of onglets) {
        expect(onglet.steps).toHaveLength(3);
      }
    }
  });

  it("garde les mêmes identifiants d'onglet dans les deux langues", () => {
    // Ils servent d'ancre ARIA entre l'onglet et son panneau. Traduits, ils
    // ne casseraient rien de visible — juste le lien que suit un lecteur
    // d'écran.
    expect(homeContent.en.howItWorks.tabs.map((t) => t.id)).toEqual(
      homeContent.fr.howItWorks.tabs.map((t) => t.id),
    );
  });

  it("pose une FAQ dont chaque question se termine par un point d'interrogation", () => {
    // Ces libellés partent tels quels dans le JSON-LD `FAQPage`. Une entrée
    // qui n'est pas une question y passerait quand même, et affaiblirait le
    // bloc entier aux yeux des moteurs.
    for (const langue of LANGUES) {
      const questions = homeContent[langue].faq.items;
      expect(questions.length).toBeGreaterThanOrEqual(5);
      for (const { question } of questions) {
        expect(question.trimEnd().endsWith("?")).toBe(true);
      }
    }
  });
});
