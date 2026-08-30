/**
 * Les événements de mesure, en un seul endroit.
 *
 * ═══ Pourquoi une couche, et non `gtag` appelé partout ═══
 *
 * Un appel direct dans un composant part sans attendre le consentement,
 * échappe au nommage commun, et se duplique dès qu'on copie le
 * composant. Ici, une seule fonction décide de tout — y compris de ne
 * rien envoyer.
 *
 * ═══ Aucune régie n'est branchée aujourd'hui ═══
 *
 * Ce site n'a ni GTM, ni pixel, ni Analytics : le README en fait une
 * qualité — « aucun appel réseau ». La couche existe donc **prête**, et
 * se contente de la console en développement.
 *
 * Le jour où une régie arrive, elle se branche dans `send`, à un seul
 * endroit, et tous les événements la suivent.
 */

export const EVENTS = {
  prelaunchViewed: "prelaunch_viewed",
  prelaunchIntentSelected: "prelaunch_intent_selected",
  prelaunchRouteCompleted: "prelaunch_route_completed",
  prelaunchTimingCompleted: "prelaunch_timing_completed",
  prelaunchDetailsCompleted: "prelaunch_details_completed",
  prelaunchLeadSubmitted: "prelaunch_lead_submitted",
  prelaunchLeadSuccess: "prelaunch_lead_success",
  prelaunchLeadError: "prelaunch_lead_error",
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];
export type EventParams = Record<string, string | number | boolean | undefined>;

/**
 * Signale un événement.
 *
 * N'échoue jamais : une erreur de mesure ne doit pas interrompre une
 * inscription. C'est le sens de la hiérarchie — on collecte pour
 * comprendre, on n'empêche pas pour mesurer.
 */
export function track(event: EventName, params: EventParams = {}) {
  if (typeof window === "undefined") return;

  const propre: EventParams = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") propre[k] = v;
  }

  // `dataLayer` est la convention de Google Tag Manager : le poser ici
  // suffira le jour où le conteneur sera ajouté, sans retoucher un seul
  // composant.
  const layer = (window as unknown as { dataLayer?: unknown[] }).dataLayer;
  if (Array.isArray(layer)) {
    layer.push({ event, ...propre });
    return;
  }

  if (process.env.NODE_ENV === "development") {
    console.info("[mesure]", event, propre);
  }
}
