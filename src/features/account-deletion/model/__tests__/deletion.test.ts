import { describe, expect, it } from "vitest";

import { canRequest, codeLooksValid, emailLooksValid, normalizeCode } from "../deletion";

describe("la première étape", () => {
  it("exige une adresse plausible et la confirmation", () => {
    expect(canRequest("aicha@example.com", true)).toBe(true);
    expect(canRequest("aicha@example.com", false)).toBe(false);
    expect(canRequest("aicha", true)).toBe(false);
    expect(canRequest("", true)).toBe(false);
  });

  it("accepte une adresse relais Apple", () => {
    expect(emailLooksValid("x7k2p9@privaterelay.appleid.com")).toBe(true);
  });

  it("tolère les espaces autour de l'adresse", () => {
    expect(emailLooksValid("  aicha@example.com ")).toBe(true);
  });
});

describe("le code", () => {
  it("retire les espaces d'un copier-coller", () => {
    expect(normalizeCode("482 913")).toBe("482913");
  });

  it("n'accepte que des chiffres", () => {
    expect(codeLooksValid("482913")).toBe(true);
    expect(codeLooksValid("48A913")).toBe(false);
    expect(codeLooksValid("12")).toBe(false);
  });
});
