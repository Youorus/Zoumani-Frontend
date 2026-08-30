/**
 * Le consentement, et ce qu'il commande.
 *
 * ═══ Pourquoi trois catégories, et non une ═══
 *
 * Il n'y en avait qu'une. Le bandeau annonçait « nous aimerions mesurer
 * les visites », et le bouton « Accepter » posait `ad_storage`,
 * `ad_user_data` et `ad_personalization` en même temps
 * qu'`analytics_storage`. Autrement dit : on demandait l'autorisation de
 * compter, on prenait celle de cibler.
 *
 * Ce n'est pas un détail de formulation. La CNIL exige un consentement
 * **par finalité** : accepter la mesure d'audience n'autorise pas la
 * publicité, et un accord obtenu sur une finalité qu'on n'a pas nommée
 * n'est pas un accord. La distinction vaut aussi en Belgique, où l'APD
 * applique la même lecture du RGPD.
 *
 * Trois catégories, donc :
 *
 * - **nécessaire** — jamais demandée, jamais refusable, et c'est
 *   légitime : le brouillon du formulaire et le choix de consentement
 *   lui-même sont exemptés parce qu'ils servent le service demandé.
 * - **analytics** — mesure d'audience. GA4, Clarity.
 * - **marketing** — publicité et remarketing. Rien n'est branché
 *   aujourd'hui ; la catégorie existe pour que le jour où un pixel
 *   arrive, il trouve un consentement déjà distinct au lieu d'être
 *   glissé sous celui de la mesure.
 *
 * ═══ Pourquoi refusé par défaut ═══
 *
 * Un traceur non exempté ne se dépose qu'après accord, et la charge de la
 * preuve pèse sur l'éditeur. Le « consentement implicite par la poursuite
 * de la navigation » n'existe plus depuis 2020.
 *
 * ═══ Pourquoi dans `localStorage` ═══
 *
 * Un choix vaut pour les visites suivantes : le redemander à chaque
 * arrivée est exactement ce qui fait cliquer « tout accepter » sans lire.
 */

export type ConsentChoice = {
  analytics: boolean;
  marketing: boolean;
};

/** Clé actuelle, qui porte les deux catégories. */
const KEY = "zoumani.consent.v2";

/**
 * Ancienne clé, à une seule valeur.
 *
 * Elle est relue une fois pour ne pas reposer la question à qui a déjà
 * répondu. Un « granted » d'alors accordait la publicité en même temps
 * que la mesure — mais il avait été donné sur un texte qui ne parlait que
 * de mesure. On ne reporte donc que la mesure : reconduire un accord
 * publicitaire jamais demandé serait le conserver à tort.
 */
const LEGACY_KEY = "zoumani.consent.analytics";

export const CONSENT_ALL: ConsentChoice = { analytics: true, marketing: true };
export const CONSENT_NONE: ConsentChoice = { analytics: false, marketing: false };

export function readConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ConsentChoice>;
      return {
        analytics: parsed.analytics === true,
        marketing: parsed.marketing === true,
      };
    }
    const legacy = window.localStorage.getItem(LEGACY_KEY);
    if (legacy === "granted") return { analytics: true, marketing: false };
    if (legacy === "denied") return CONSENT_NONE;
    return null;
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
export function writeConsent(choice: ConsentChoice) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(choice));
    window.localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* Navigation privée : le choix ne survivra pas à la visite. */
  }

  pushConsentUpdate(choice);
  // Les balises chargées après coup — GA4, Clarity — écoutent cet
  // événement plutôt que d'interroger `localStorage` en boucle.
  window.dispatchEvent(new CustomEvent<ConsentChoice>("zoumani:consent", { detail: choice }));
}

/** Traduit les deux catégories dans les quatre signaux du Consent Mode. */
export function pushConsentUpdate(choice: ConsentChoice) {
  const layer = (window as unknown as { dataLayer?: unknown[] }).dataLayer;
  if (!Array.isArray(layer)) return;

  const mesure = choice.analytics ? "granted" : "denied";
  const publicite = choice.marketing ? "granted" : "denied";

  // La forme exacte qu'attend le Consent Mode : un objet `arguments`, et
  // non un objet simple. `gtag` le construit normalement ; ici on pousse
  // directement pour ne pas charger sa bibliothèque.
  layer.push({
    0: "consent",
    1: "update",
    2: {
      analytics_storage: mesure,
      ad_storage: publicite,
      ad_user_data: publicite,
      ad_personalization: publicite,
    },
    length: 3,
  });
}
