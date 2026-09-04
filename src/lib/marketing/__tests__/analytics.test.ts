import { beforeEach, describe, expect, it, vi } from "vitest";

import { EVENTS, track } from "@/lib/marketing/events";
import { CONSENT_NONE, readConsent, writeConsent } from "@/lib/marketing/consent";

/**
 * Ce que ces tests protègent : la donnée personnelle qui part par
 * inadvertance, et le consentement qui accorde plus qu'il ne demande.
 */

function couche(): Record<string, unknown>[] {
  return (window as unknown as { dataLayer: Record<string, unknown>[] }).dataLayer;
}

beforeEach(() => {
  (window as unknown as { dataLayer: unknown[] }).dataLayer = [];
  window.localStorage.clear();
});

describe("Mesure", () => {
  it("n’envoie jamais une donnée personnelle, même si on la lui passe", () => {
    // La règle est facile à énoncer et facile à enfreindre : un jour
    // quelqu'un ajoutera `email` pour déboguer et l'oubliera. Le filtre
    // est au seul endroit par lequel tout passe.
    vi.spyOn(console, "error").mockImplementation(() => {});
    track(EVENTS.prelaunchSuccess, {
      corridor: "paris-douala",
      email: "marc@exemple.fr",
      phone: "+33612345678",
      first_name: "Marc",
    });

    const evenement = couche()[0];
    expect(evenement.corridor).toBe("paris-douala");
    expect(evenement.email).toBeUndefined();
    expect(evenement.phone).toBeUndefined();
    expect(evenement.first_name).toBeUndefined();
  });

  it("laisse passer les propriétés de campagne", () => {
    track(EVENTS.prelaunchSubmit, {
      utm_source: "meta",
      utm_campaign: "diaspora-cmr",
      origin_country: "FR",
    });

    expect(couche()[0]).toMatchObject({
      event: "prelaunch_submit",
      utm_source: "meta",
      utm_campaign: "diaspora-cmr",
      origin_country: "FR",
    });
  });

  it("nomme la conversion prelaunch_success", () => {
    // C'est le nom à marquer « key event » dans GA4. S'il change, la
    // conversion cesse d'être comptée sans que rien n'échoue.
    expect(EVENTS.prelaunchSuccess).toBe("prelaunch_success");
  });
});

describe("Consentement", () => {
  it("n’accorde pas la publicité quand on accepte la mesure", () => {
    // Le bandeau annonçait « mesurer les visites » et le bouton
    // « Accepter » posait ad_storage, ad_user_data et ad_personalization.
    // On demandait l'autorisation de compter, on prenait celle de cibler.
    writeConsent({ analytics: true, marketing: false });

    const maj = couche().find((e) => e[1] === "update")?.[2] as Record<string, string>;
    expect(maj.analytics_storage).toBe("granted");
    expect(maj.ad_storage).toBe("denied");
    expect(maj.ad_user_data).toBe("denied");
    expect(maj.ad_personalization).toBe("denied");
  });

  it("refuse tout par défaut, faute de réponse", () => {
    expect(readConsent()).toBeNull();
  });

  it("relit un ancien refus sans reposer la question", () => {
    window.localStorage.setItem("zoumani.consent.analytics", "denied");
    expect(readConsent()).toEqual(CONSENT_NONE);
  });

  it("ne reconduit pas un accord publicitaire jamais demandé", () => {
    // L'ancien « granted » avait été donné sur un texte qui ne parlait
    // que de mesure : reporter la publicité serait conserver à tort un
    // accord qu'on n'a pas sollicité.
    window.localStorage.setItem("zoumani.consent.analytics", "granted");
    expect(readConsent()).toEqual({ analytics: true, marketing: false });
  });
});

describe("Convention d’émission", () => {
  it("parle la convention GTM quand un conteneur est configuré", () => {
    // Les tests tournent sans `NEXT_PUBLIC_GTM_ID`, donc sur le chemin
    // `gtag`. Ce test décrit l'autre branche par son absence : quand
    // `gtag` n'existe pas, on retombe sur le `dataLayer`, qui est la
    // forme que GTM écoute.
    delete (window as unknown as { gtag?: unknown }).gtag;
    track(EVENTS.routeStarted, { corridor: "paris-douala" });

    expect(couche()[0]).toMatchObject({ event: "route_started", corridor: "paris-douala" });
  });

  it("appelle gtag quand il est là, sinon GA4 n’entend rien", () => {
    // `gtag.js` ignore `{ event: "..." }` dans le dataLayer : il ne lit
    // que `gtag('event', nom, params)`. C'est ce qui faisait que les
    // treize événements du tunnel n'atteignaient jamais GA4.
    const appels: unknown[][] = [];
    (window as unknown as { gtag: (...a: unknown[]) => void }).gtag = (...a) => appels.push(a);

    track(EVENTS.prelaunchSuccess, { corridor: "paris-douala" });

    expect(appels).toEqual([["event", "prelaunch_success", { corridor: "paris-douala" }]]);
    expect(couche()).toHaveLength(0);
    delete (window as unknown as { gtag?: unknown }).gtag;
  });
});

describe("Consentement transmis en cours de visite", () => {
  it("appelle gtag('consent','update') quand gtag est là", () => {
    // Le défaut relevé en production le 4 septembre 2026 : la mise à
    // jour partait en `dataLayer.push({0:…,1:…,2:…,length:3})`, la
    // convention de GTM. `gtag.js` chargé seul ne la reconnaît pas, et
    // GA4 restait en « refusé » pendant toute la première visite —
    // c'est-à-dire chez la totalité du trafic publicitaire.
    const appels: unknown[][] = [];
    (window as unknown as { gtag: (...a: unknown[]) => void }).gtag = (...a) => appels.push(a);

    writeConsent({ analytics: true, marketing: true });

    expect(appels).toEqual([
      [
        "consent",
        "update",
        {
          analytics_storage: "granted",
          ad_storage: "granted",
          ad_user_data: "granted",
          ad_personalization: "granted",
        },
      ],
    ]);
    // Et rien en double dans la couche : les deux chemins s'excluent.
    expect(couche().find((e) => e[1] === "update")).toBeUndefined();
    delete (window as unknown as { gtag?: unknown }).gtag;
  });

  it("transmet un refus aussi clairement qu’un accord", () => {
    // Un refus qui ne part pas laisse les balises dans l'état par
    // défaut — qui se trouve être « refusé » aujourd'hui, mais qui ne
    // le sera plus le jour où quelqu'un changera l'amorçage.
    const appels: unknown[][] = [];
    (window as unknown as { gtag: (...a: unknown[]) => void }).gtag = (...a) => appels.push(a);

    writeConsent(CONSENT_NONE);

    expect(appels[0][2]).toEqual({
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    delete (window as unknown as { gtag?: unknown }).gtag;
  });

  it("retombe sur la convention GTM si gtag manque", () => {
    delete (window as unknown as { gtag?: unknown }).gtag;
    writeConsent({ analytics: true, marketing: false });

    const maj = couche().find((e) => e[1] === "update")?.[2] as Record<string, string>;
    expect(maj.analytics_storage).toBe("granted");
    expect(maj.ad_storage).toBe("denied");
  });
});

describe("Le tunnel", () => {
  it("nomme l’arrivée sur une étape funnel_step_viewed", () => {
    // Sans lui, on comptait les franchissements et jamais les
    // abandons : quelqu'un bloqué sur une étape ne se distinguait pas
    // de quelqu'un qui n'y était jamais arrivé.
    expect(EVENTS.funnelStepViewed).toBe("funnel_step_viewed");
  });

  it("porte de quoi lire un abandon", () => {
    track(EVENTS.funnelStepViewed, {
      intent_role: "traveler",
      step: "contact",
      step_index: 4,
    });

    expect(couche()[0]).toMatchObject({
      event: "funnel_step_viewed",
      intent_role: "traveler",
      step: "contact",
      step_index: 4,
    });
  });
});
