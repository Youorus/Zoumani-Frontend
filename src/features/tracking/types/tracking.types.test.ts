import { describe, expect, it } from "vitest";

import {
  isIncident,
  needsLabel,
  stateOf,
  toJourney,
  trackFor,
  type Journey,
  type RawJourney,
} from "./tracking.types";

const BRUT: RawJourney = {
  id: "j-1",
  shipment_id: "s-1",
  step: "awaiting_dropoff",
  is_sender: true,
  action: "Déposez votre colis au point relais.",
  history: [{ step: "awaiting_dropoff", occurred_at: "2026-08-15T10:00:00Z" }],
  deadline_at: null,
};

function journey(surcharges: Partial<Journey> = {}): Journey {
  return { ...toJourney(BRUT), ...surcharges };
}

describe("toJourney", () => {
  it("tolère un détail absent", () => {
    // L'API l'omet quand il n'y a rien à dire : `undefined` dans la vue
    // afficherait le mot « undefined » sous l'étape.
    expect(toJourney(BRUT).history[0].detail).toBe("");
  });

  it("tolère un historique absent", () => {
    // Une frise vide vaut mieux qu'un écran qui plante sur un parcours
    // que le serveur n'aurait pas encore rempli.
    const sans = { ...BRUT, history: undefined } as unknown as RawJourney;
    expect(toJourney(sans).history).toEqual([]);
  });
});

describe("trackFor", () => {
  it("ne mélange jamais les deux parcours", () => {
    // Le mode de remise est figé au paiement : une frise qui afficherait
    // « à déposer » à côté de « rendez-vous à convenir » décrirait un
    // parcours qui n'existe pas.
    expect(trackFor("awaiting_meeting")).not.toContain("in_transit");
    expect(trackFor("in_transit")).not.toContain("awaiting_meeting");
  });

  it("laisse l'incident hors de la frise", () => {
    // Il ne s'insère pas, il remplace : l'y placer laisserait croire que
    // la livraison suit son cours.
    expect(trackFor("in_transit")).not.toContain("incident");
  });
});

describe("stateOf", () => {
  it("marque comme franchi ce qui précède l'étape atteinte", () => {
    expect(stateOf("dropped_off", "in_transit")).toBe("done");
  });

  it("marque l'étape atteinte comme en cours", () => {
    expect(stateOf("in_transit", "in_transit")).toBe("current");
  });

  it("laisse à venir ce qui suit", () => {
    expect(stateOf("collected", "in_transit")).toBe("todo");
  });

  it("ne prétend rien sur une étape d'un autre parcours", () => {
    expect(stateOf("awaiting_meeting", "in_transit")).toBe("todo");
  });
});

describe("needsLabel", () => {
  it("propose l'étiquette à l'expéditeur avant le dépôt", () => {
    expect(needsLabel(journey())).toBe(true);
  });

  it("ne la propose jamais au voyageur", () => {
    // Il n'a rien à imprimer : c'est lui qui retire.
    expect(needsLabel(journey({ isSender: false }))).toBe(false);
  });

  it("cesse de la proposer une fois le colis parti", () => {
    // Après le dépôt, un bouton de téléchargement laisse croire qu'il
    // reste quelque chose à faire.
    expect(needsLabel(journey({ step: "in_transit" }))).toBe(false);
  });
});

describe("isIncident", () => {
  it("reconnaît le seul état qui appelle une intervention", () => {
    expect(isIncident("incident")).toBe(true);
    expect(isIncident("collected")).toBe(false);
  });
});
