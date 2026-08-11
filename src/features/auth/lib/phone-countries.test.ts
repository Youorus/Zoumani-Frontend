import { describe, expect, it } from "vitest";

import {
  countryName,
  flagEmoji,
  guessCountry,
  toDisplayCountries,
  type RawPhoneCountry,
} from "./phone-countries";

const CATALOGUE: RawPhoneCountry[] = [
  { code: "CM", calling_code: "+237", example_national_number: "671234567" },
  { code: "FR", calling_code: "+33", example_national_number: "612345678" },
  { code: "EG", calling_code: "+20", example_national_number: "1001234567" },
  { code: "EC", calling_code: "+593", example_national_number: "991234567" },
];

describe("drapeau", () => {
  it("compose le drapeau à partir des deux lettres du pays", () => {
    // Deux indicateurs régionaux : 🇨 + 🇲, que le système rend comme un
    // drapeau unique.
    expect(flagEmoji("CM")).toBe("\u{1F1E8}\u{1F1F2}");
    expect([...flagEmoji("FR")]).toHaveLength(2);
  });

  it("accepte la minuscule", () => {
    expect(flagEmoji("cm")).toBe(flagEmoji("CM"));
  });

  it("ne rend rien pour ce qui n'est pas un code pays", () => {
    // Un code invalide produirait des caractères arbitraires : mieux vaut
    // une case vide qu'un symbole incompréhensible.
    for (const invalide of ["", "F", "FRA", "1F", "++"]) {
      expect(flagEmoji(invalide)).toBe("");
    }
  });
});

describe("nom du pays", () => {
  it("traduit dans la langue demandée", () => {
    expect(countryName("CM", "fr")).toBe("Cameroun");
    expect(countryName("CM", "en")).toBe("Cameroon");
  });

  it("ne rend jamais une chaîne vide pour une région inconnue", () => {
    // Le système traduit lui-même « ZZ » en « région inconnue » ; ce qui
    // compte ici est qu'il ne lève pas et ne rende pas du vide, ce qui
    // laisserait une ligne muette dans le sélecteur.
    expect(countryName("ZZ", "fr")).not.toBe("");
  });

  it("retombe sur le code si la langue demandée est aberrante", () => {
    expect(countryName("CM", "n'importe quoi")).toBe("CM");
  });
});

describe("préparation de la liste", () => {
  it("trie selon l'alphabet de la langue, accents compris", () => {
    // Le test qui justifie `Intl.Collator` : « Égypte » se range à sa
    // place alphabétique, et non après « Zimbabwe » comme le ferait une
    // comparaison de points de code.
    const noms = toDisplayCountries(CATALOGUE, "fr").map((pays) => pays.name);

    expect(noms).toEqual(["Cameroun", "Égypte", "Équateur", "France"]);
  });

  it("porte l'indicatif, le drapeau et l'exemple de chaque pays", () => {
    const cameroun = toDisplayCountries(CATALOGUE, "fr").find(
      (pays) => pays.code === "CM",
    );

    expect(cameroun?.callingCode).toBe("+237");
    expect(cameroun?.example).toBe("671234567");
    expect(cameroun?.flag).not.toBe("");
  });
});

describe("pays présélectionné", () => {
  const pays = toDisplayCountries(CATALOGUE, "fr");

  it("suit la région de la langue du navigateur", () => {
    expect(guessCountry(pays, ["fr-CM"], "FR")).toBe("CM");
  });

  it("déduit la région d'une langue qui n'en porte pas", () => {
    // `Intl.Locale.maximize()` complète « fr » en « fr-Latn-FR ».
    expect(guessCountry(pays, ["fr"], "CM")).toBe("FR");
  });

  it("ignore une région absente du référentiel", () => {
    // Retenir un pays que le serveur ne connaît pas donnerait un
    // formulaire impossible à soumettre, sans que rien ne l'explique.
    expect(guessCountry(pays, ["ja-JP"], "CM")).toBe("CM");
  });

  it("ignore une étiquette de langue invalide", () => {
    expect(guessCountry(pays, ["n'importe quoi"], "CM")).toBe("CM");
  });

  it("prend le premier pays si même le repli est inconnu", () => {
    expect(guessCountry(pays, [], "ZZ")).toBe("CM");
  });
});
