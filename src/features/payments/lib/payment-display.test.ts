import { describe, expect, it } from "vitest";

import { displayMajorAmount } from "./payment-display";

describe("affichage d'un montant backend", () => {
  it("formate la chaîne décimale sans conversion flottante", () => {
    expect(displayMajorAmount("12345.60", "EUR")).toBe("12 345,60 €");
  });
});
