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
