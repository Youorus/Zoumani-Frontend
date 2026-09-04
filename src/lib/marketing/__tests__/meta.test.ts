import { beforeEach, describe, expect, it, vi } from "vitest";

import { EVENTS, track } from "@/lib/marketing/events";
import { _reinitialiserDedoublonnage, metaTrack } from "@/lib/marketing/meta";

/**
 * Ce que ces tests protègent : la conversion comptée deux fois, et la
 * donnée personnelle qui partirait vers une régie publicitaire.
 *
 * Un `Lead` en double fausse le coût d'acquisition **dans le sens
 * flatteur** — celui qu'on ne remet pas en question.
 */

type Appel = unknown[];

function poserPixel(): Appel[] {
  const appels: Appel[] = [];
  (window as unknown as { fbq: (...a: unknown[]) => void }).fbq = (...a) => appels.push(a);
  return appels;
}

function retirerPixel() {
  delete (window as unknown as { fbq?: unknown }).fbq;
}

beforeEach(() => {
  (window as unknown as { dataLayer: unknown[] }).dataLayer = [];
  delete (window as unknown as { gtag?: unknown }).gtag;
  retirerPixel();
  _reinitialiserDedoublonnage();
});

describe("Pixel Meta", () => {
  it("ne fait rien tant que le pixel n’est pas chargé", () => {
    // C'est le cas de quelqu'un qui a refusé la publicité : le script
    // n'est pas téléchargé, `fbq` n'existe pas, et la mesure ne doit ni
    // échouer ni bloquer l'inscription.
    expect(() => metaTrack("Lead", {}, "abc")).not.toThrow();
    expect(metaTrack("Lead", {}, "abc")).toBe(false);
  });

  it("n’envoie un événement identifié qu’une seule fois", () => {
    const appels = poserPixel();

    metaTrack("Lead", { content_category: "sender" }, "lead-42");
    metaTrack("Lead", { content_category: "sender" }, "lead-42");

    expect(appels).toHaveLength(1);
  });

  it("laisse passer deux préinscriptions distinctes", () => {
    const appels = poserPixel();

    metaTrack("Lead", {}, "lead-1");
    metaTrack("Lead", {}, "lead-2");

    expect(appels).toHaveLength(2);
  });

  it("ne dédoublonne pas les PageView, qui n’ont pas d’identifiant", () => {
    const appels = poserPixel();

    metaTrack("PageView");
    metaTrack("PageView");

    expect(appels).toHaveLength(2);
  });
});

describe("Le relais depuis la couche d’événements", () => {
  it("traduit prelaunch_success en Lead, avec le versant du marché", () => {
    const appels = poserPixel();

    track(EVENTS.prelaunchSuccess, {
      intent_role: "traveler",
      origin: "Paris",
      destination: "Douala",
      event_id: "lead-7",
    });

    expect(appels).toEqual([
      ["track", "Lead", { content_category: "traveler" }, { eventID: "lead-7" }],
    ]);
  });

  it("ne transmet pas l’identifiant de déduplication à GA4", () => {
    // Il ne sert qu'à Meta. Envoyer à une régie de mesure un
    // identifiant d'enregistrement dont elle n'a aucun usage n'a pas de
    // raison d'être.
    poserPixel();

    track(EVENTS.prelaunchSuccess, { intent_role: "sender", event_id: "lead-7" });

    const evenement = (window as unknown as { dataLayer: Record<string, unknown>[] })
      .dataLayer[0];
    expect(evenement.event).toBe("prelaunch_success");
    expect(evenement.event_id).toBeUndefined();
  });

  it("n’envoie à Meta aucune des étapes intermédiaires", () => {
    // Sur un test à 25 €, aucune n'atteindra le volume qui permettrait
    // d'optimiser dessus : les envoyer n'ajouterait que des requêtes et
    // de la donnée en circulation.
    const appels = poserPixel();

    track(EVENTS.routeCompleted, { intent_role: "sender" });
    track(EVENTS.contactStarted, { intent_role: "sender" });
    track(EVENTS.prelaunchSubmit, { intent_role: "sender" });
    track(EVENTS.funnelStepViewed, { intent_role: "sender", step: "contact" });

    expect(appels).toHaveLength(0);
  });

  it("écarte les données personnelles avant Meta comme avant GA4", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const appels = poserPixel();

    track(EVENTS.prelaunchSuccess, {
      intent_role: "sender",
      email: "marc@exemple.fr",
      phone: "+33612345678",
      event_id: "lead-9",
    });

    const params = appels[0][2] as Record<string, unknown>;
    expect(params.email).toBeUndefined();
    expect(params.phone).toBeUndefined();
    expect(params.content_category).toBe("sender");
  });
});
