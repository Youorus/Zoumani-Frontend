import { describe, expect, it } from "vitest";

import {
  fromMinorUnits,
  toCapacity,
  toCatalog,
  toFlightLookup,
  toMinorUnits,
  type RawCapacity,
  type RawCatalog,
  type RawFlightLookup,
} from "./travel.types";

/**
 * La frontière entre ce que l'API rend et ce que l'interface manipule.
 *
 * C'est le seul endroit où la conversion a lieu. Ces tests existent pour
 * qu'elle y reste : une seconde conversion ailleurs finirait par
 * diverger, et l'un des deux écrans afficherait un prix faux.
 */

describe("les montants", () => {
  it("accepte la virgule du clavier français", () => {
    // Refuser la virgule rendrait le champ pénible pour la majorité des
    // utilisateurs du corridor visé.
    expect(toMinorUnits("8,50")).toBe(850);
    expect(toMinorUnits("8.50")).toBe(850);
  });

  it("convertit sans jamais laisser passer un flottant", () => {
    // 0,1 + 0,2 ne vaut pas 0,3 en binaire. L'entier est la vérité.
    expect(toMinorUnits("0.10")).toBe(10);
    expect(toMinorUnits("12")).toBe(1200);
    expect(toMinorUnits(" 7,05 ")).toBe(705);
  });

  it.each(["", "abc", "8,5,5", "-3", "8,555", "1e3"])(
    "refuse une saisie qui n'est pas un montant : %s",
    (saisie) => {
      // Rendre `null` plutôt qu'un `NaN` : un `NaN` se propage
      // silencieusement jusqu'à la base.
      expect(toMinorUnits(saisie)).toBeNull();
    },
  );

  it("revient à une saisie lisible pour pré-remplir un champ", () => {
    expect(fromMinorUnits(850)).toBe("8.50");
    expect(fromMinorUnits(5)).toBe("0.05");
  });
});

describe("la consultation d'un vol", () => {
  it("traduit un vol confirmé avec son horaire", () => {
    const brut: RawFlightLookup = {
      outcome: "confirmed",
      schedule: {
        departure_at: "2026-08-15T10:25:00Z",
        arrival_at: "2026-08-15T17:45:00Z",
        flight_designator: "AF946",
      },
    };

    const lookup = toFlightLookup(brut);

    expect(lookup.outcome).toBe("confirmed");
    expect(lookup.schedule?.departureAt).toBe("2026-08-15T10:25:00Z");
    expect(lookup.schedule?.flightDesignator).toBe("AF946");
  });

  it("distingue l'indisponibilité d'un refus", () => {
    // Le test qui protège les voyageurs honnêtes : confondre les deux
    // ferait accuser d'invention quelqu'un un jour de panne.
    expect(toFlightLookup({ outcome: "unavailable", schedule: null }).outcome).toBe(
      "unavailable",
    );
    expect(toFlightLookup({ outcome: "not_found", schedule: null }).outcome).toBe(
      "not_found",
    );
  });

  it("ne fabrique pas d'horaire quand il n'y en a pas", () => {
    expect(toFlightLookup({ outcome: "not_found", schedule: null }).schedule).toBeNull();
  });
});

describe("le catalogue", () => {
  const brut: RawCatalog = {
    categories: [
      {
        code: "medication",
        label: "Médicaments",
        unit: "piece",
        restrictions: ["prescription"],
        requires_traveler_consent: true,
      },
    ],
    prohibited: ["Argent liquide"],
  };

  it("conserve le consentement exigé", () => {
    // Perdre ce drapeau ferait cocher par défaut une catégorie qui
    // engage le voyageur — une signature obtenue sans information.
    expect(toCatalog(brut).categories[0].requiresTravelerConsent).toBe(true);
  });

  it("conserve l'unité et les restrictions", () => {
    const categorie = toCatalog(brut).categories[0];

    expect(categorie.unit).toBe("piece");
    expect(categorie.restrictions).toEqual(["prescription"]);
  });

  it("rend les interdits tels quels", () => {
    expect(toCatalog(brut).prohibited).toEqual(["Argent liquide"]);
  });
});

describe("une offre de capacité", () => {
  const brut: RawCapacity = {
    id: "c1",
    trip_id: "t1",
    status: "draft",
    total_weight_kg: 23,
    available_weight_kg: 15,
    currency: "EUR",
    offers: [
      {
        category_code: "clothing",
        price_minor: 850,
        price_major: "8.50",
        currency: "EUR",
        per_piece: false,
      },
    ],
    accepts_pickup: false,
    notes: null,
    is_editable: true,
  };

  it("garde le prix affichable calculé par le serveur", () => {
    // Le recalculer ici produirait un second arrondi, qui divergerait.
    expect(toCapacity(brut).offers[0].priceMajor).toBe("8.50");
    expect(toCapacity(brut).offers[0].priceMinor).toBe(850);
  });

  it("distingue le poids offert de ce qui reste réservable", () => {
    const capacite = toCapacity(brut);

    expect(capacite.totalWeightKg).toBe(23);
    expect(capacite.availableWeightKg).toBe(15);
  });

  it("conserve la modifiabilité décidée par le serveur", () => {
    // Faux dès qu'un kilo est engagé : un expéditeur a réservé sur ce
    // prix, et l'interface ne doit pas proposer de le changer.
    expect(toCapacity({ ...brut, is_editable: false }).isEditable).toBe(false);
  });
});
