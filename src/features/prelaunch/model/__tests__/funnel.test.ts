import { describe, expect, it } from "vitest";

import {
  EMPTY_FUNNEL,
  canSubmit,
  contactIsUsable,
  routeIsComplete,
  toLeadDraft,
  type FunnelState,
} from "../funnel";

/**
 * Ce que ces tests protègent :
 *
 * 1. **le trajet est exigé** — c'est la seule donnée qui ne se devine pas
 *    après coup, et celle qui dit où ouvrir en premier ;
 * 2. **un contact suffit** — exiger les deux ferait renoncer ceux qui ne
 *    donnent qu'un numéro ;
 * 3. **la validation n'écarte que l'évidence** — refuser une adresse
 *    valide mais inhabituelle coûte une inscription.
 */

function state(patch: Partial<FunnelState> = {}): FunnelState {
  return {
    ...EMPTY_FUNNEL,
    intention: "sender",
    originCity: "Paris",
    destinationCity: "Douala",
    firstName: "Marc",
    email: "marc@example.com",
    consent: true,
    ...patch,
  };
}

describe("le trajet", () => {
  it("exige deux villes nommées", () => {
    expect(routeIsComplete(state())).toBe(true);
    expect(routeIsComplete(state({ destinationCity: "" }))).toBe(false);
  });

  it("écarte une saisie d'une seule lettre", () => {
    expect(routeIsComplete(state({ originCity: "P" }))).toBe(false);
  });

  it("ignore les espaces autour", () => {
    expect(routeIsComplete(state({ originCity: "  Lyon  " }))).toBe(true);
  });
});

describe("le contact", () => {
  it("accepte un e-mail seul", () => {
    expect(contactIsUsable(state({ phone: "" }))).toBe(true);
  });

  it("accepte un téléphone seul", () => {
    // La majorité sur les corridors visés ne donne qu'un numéro.
    expect(contactIsUsable(state({ email: "", phone: "+237 6 12 34 56 78" }))).toBe(true);
  });

  it("refuse l'absence des deux", () => {
    expect(contactIsUsable(state({ email: "", phone: "" }))).toBe(false);
  });

  it("n'écarte que l'évidence", () => {
    // Sans arobase : évident. Avec un domaine inhabituel : accepté, car
    // le refuser coûterait une inscription réelle.
    expect(contactIsUsable(state({ email: "marc", phone: "" }))).toBe(false);
    expect(contactIsUsable(state({ email: "m@a.museum", phone: "" }))).toBe(true);
  });
});

describe("la soumission", () => {
  it("exige le consentement", () => {
    expect(canSubmit(state())).toBe(true);
    expect(canSubmit(state({ consent: false }))).toBe(false);
  });

  it("exige un prénom", () => {
    expect(canSubmit(state({ firstName: "   " }))).toBe(false);
  });

  it("refuse sans intention choisie", () => {
    expect(canSubmit(state({ intention: null }))).toBe(false);
  });
});

describe("la traduction vers le serveur", () => {
  it("structure le corridor en deux places", () => {
    const draft = toLeadDraft(state());

    expect(draft.origin).toEqual({ city: "Paris" });
    expect(draft.destination).toEqual({ city: "Douala" });
  });

  it("omet les champs vides plutôt que d'envoyer des chaînes vides", () => {
    const draft = toLeadDraft(state({ travelOn: "", parcelKind: "" }));

    expect(draft.travelOn).toBeUndefined();
    expect(draft.parcelKind).toBeUndefined();
  });

  it("refuse de traduire sans intention", () => {
    expect(() => toLeadDraft(state({ intention: null }))).toThrow();
  });
});
