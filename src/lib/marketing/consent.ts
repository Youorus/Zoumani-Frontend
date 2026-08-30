/**
 * Le consentement à la mesure, et ce qu'il commande.
 *
 * ═══ Pourquoi « refusé » par défaut ═══
 *
 * En France, un traceur de mesure d'audience non exempté ne se dépose
 * qu'après accord — la CNIL est explicite, et la charge de la preuve pèse
 * sur l'éditeur. Le « consentement implicite par la poursuite de la
 * navigation » n'existe plus depuis 2020.
 *
 * Google Tag Manager est donc chargé en **Consent Mode v2**, avec tout
 * refusé au départ : les balises se chargent, mais aucune n'écrit de
 * cookie ni n'envoie d'identifiant tant que la personne n'a pas accepté.
 * Les mesures anonymes remontent quand même — assez pour compter les
 * visites, pas assez pour suivre quelqu'un.
 *
 * ═══ Pourquoi il tient dans `localStorage` ═══
 *
 * Un choix vaut pour les visites suivantes : le redemander à chaque
 * arrivée est ce qui fait cliquer « tout accepter » sans lire.
 */

export type ConsentState = "granted" | "denied";

const KEY = "zoumani.consent.analytics";

export function readConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw === "granted" || raw === "denied" ? raw : null;
  } catch {
    return null;
  }
}

/**
 * Retient le choix, et le transmet à Google.
 *
 * `consent update` est la seule façon prévue de revenir sur un refus
 * initial sans recharger la page : les balises déjà chargées relisent
 * l'état et se débloquent d'elles-mêmes.
 */
export function writeConsent(state: ConsentState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, state);
  } catch {
    /* Navigation privée : le choix ne survivra pas à la visite. */
  }

  const layer = (window as unknown as { dataLayer?: unknown[] }).dataLayer;
  if (Array.isArray(layer)) {
    // La forme exacte qu'attend le Consent Mode : un objet `arguments`,
    // et non un objet simple. `gtag` le construit normalement ; ici on
    // pousse directement pour ne pas charger sa bibliothèque.
    layer.push({
      0: "consent",
      1: "update",
      2: {
        analytics_storage: state,
        ad_storage: state,
        ad_user_data: state,
        ad_personalization: state,
      },
      length: 3,
    });
  }
}
