import { describe, expect, it } from "vitest";

import { searchCities } from "@/features/shipment-search/data/search-cities";

/**
 * La jointure entre le sélecteur de villes et l'API.
 *
 * Le sélecteur parle en villes — « paris » — quand l'API attend un code
 * IATA. Le code est extrait du libellé d'aéroport, qui suit la forme
 * « Nom · CODE ». Ce test existe parce qu'une entrée mal formée ne
 * casserait rien à la compilation : elle produirait simplement une
 * recherche vide, et personne ne saurait pourquoi.
 */
function airportOf(cityValue: string): string {
  const ville = searchCities.find((candidate) => candidate.value === cityValue);
  return ville?.airport.split("·").pop()?.trim() ?? "";
}

describe("le code d'aéroport d'une ville", () => {
  it("extrait le code des villes du corridor", () => {
    expect(airportOf("paris")).toBe("CDG");
    expect(airportOf("bruxelles")).toBe("BRU");
    expect(airportOf("douala")).toBe("DLA");
  });

  it.each(searchCities.map((city) => city.value))(
    "rend un code IATA à trois lettres pour %s",
    (value) => {
      // Une entrée mal formée produirait une recherche vide sans que
      // rien ne l'explique — ni à la compilation, ni à l'écran.
      expect(airportOf(value)).toMatch(/^[A-Z]{3}$/);
    },
  );

  it("rend une chaîne vide pour une ville inconnue", () => {
    expect(airportOf("atlantide")).toBe("");
  });
});
