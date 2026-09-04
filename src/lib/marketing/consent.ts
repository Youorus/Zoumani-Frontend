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
 * - **marketing** — publicité. Le pixel Meta, depuis le 4 septembre
 *   2026. La catégorie avait été créée avant lui, précisément pour qu'il
 *   trouve un consentement déjà distinct au lieu d'être glissé sous
 *   celui de la mesure : quelqu'un qui accepte de compter n'a pas
 *   accepté d'être ciblé.
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
  return interpreter(lireBrut());
}

/** L'événement émis au clic. Les balises chargées après coup l'écoutent. */
export const CONSENT_EVENT = "zoumani:consent";

/**
 * Ce que porte le stockage, sous une forme **stable**.
 *
 * Une chaîne, et non l'objet : `useSyncExternalStore` compare les
 * instantanés par identité, et un objet reconstruit à chaque lecture
 * ferait boucler le rendu à l'infini. Les deux clés y sont réunies
 * parce que la lecture les considère ensemble.
 */
function lireBrut(): string {
  if (typeof window === "undefined") return "";
  try {
    return `${window.localStorage.getItem(KEY) ?? ""}|${window.localStorage.getItem(LEGACY_KEY) ?? ""}`;
  } catch {
    /* Navigation privée : on répond comme si rien n'avait été retenu. */
    return "";
  }
}

function interpreter(brut: string): ConsentChoice | null {
  const [actuel, ancien] = brut.split("|");
  if (actuel) {
    try {
      const parsed = JSON.parse(actuel) as Partial<ConsentChoice>;
      return { analytics: parsed.analytics === true, marketing: parsed.marketing === true };
    } catch {
      return null;
    }
  }
  if (ancien === "granted") return { analytics: true, marketing: false };
  if (ancien === "denied") return CONSENT_NONE;
  return null;
}

/**
 * L'instantané mémorisé, pour `useSyncExternalStore`.
 *
 * ═══ Pourquoi ce détour ═══
 *
 * Le bandeau lisait le stockage dans un initialiseur `useState`. Le
 * serveur rendait donc « rien » et le navigateur, au premier rendu,
 * rendait le bandeau : React trouvait deux arbres différents, jetait le
 * sien et refaisait tout — l'erreur `#418` relevée en production sur
 * chaque chargement.
 *
 * Le déplacer dans un effet corrigeait l'hydratation mais posait un
 * `setState` synchrone dans un effet, que le linter refuse à raison :
 * c'est un rendu en cascade au chargement.
 *
 * `useSyncExternalStore` est fait exactement pour cela. Il rend
 * l'instantané **serveur** pendant l'hydratation — donc le même arbre
 * des deux côtés — puis bascule sur l'instantané client une fois
 * hydraté. Ni mésentente, ni effet.
 *
 * Le cache existe parce que la fonction doit rendre la **même
 * référence** tant que le stockage n'a pas changé, sans quoi React
 * re-rendrait sans fin.
 */
let cacheBrut: string | null = null;
let cacheValeur: ConsentChoice | null = null;

export function consentSnapshot(): ConsentChoice | null {
  const brut = lireBrut();
  if (brut !== cacheBrut) {
    cacheBrut = brut;
    cacheValeur = interpreter(brut);
  }
  return cacheValeur;
}

/** Pendant le rendu serveur et l'hydratation : « on ne sait pas encore ». */
export function consentServerSnapshot(): ConsentChoice | null | undefined {
  return undefined;
}

/**
 * S'abonne aux changements.
 *
 * `storage` en plus de l'événement maison : quelqu'un qui répond dans un
 * autre onglet ne doit pas avoir à recharger celui-ci.
 */
export function subscribeConsent(auChangement: () => void): () => void {
  window.addEventListener(CONSENT_EVENT, auChangement);
  window.addEventListener("storage", auChangement);
  return () => {
    window.removeEventListener(CONSENT_EVENT, auChangement);
    window.removeEventListener("storage", auChangement);
  };
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
  // Les balises chargées après coup — Clarity, le pixel Meta — écoutent
  // cet événement plutôt que d'interroger `localStorage` en boucle.
  window.dispatchEvent(new CustomEvent<ConsentChoice>(CONSENT_EVENT, { detail: choice }));
}

/**
 * Traduit les deux catégories dans les quatre signaux du Consent Mode.
 *
 * ═══ Pourquoi `gtag()` et non un `dataLayer.push` ═══
 *
 * Cette fonction poussait un objet simple imitant la forme d'un
 * `arguments` — `{0:"consent", 1:"update", 2:{…}, length:3}`. C'est la
 * convention de **Google Tag Manager**, et `gtag.js` chargé seul ne la
 * reconnaît pas : il ne lit du `dataLayer` que les véritables objets
 * `arguments` produits par `gtag()`.
 *
 * Conséquence mesurée en production le 4 septembre 2026 : le clic sur
 * « Accepter » ne débloquait rien. GA4 restait en `gcs=G100` — mesure
 * refusée — pendant toute la première visite, aucun cookie `_ga` n'était
 * posé, et le tunnel n'était donc rattachable ni à une session ni à une
 * campagne. Au rechargement suivant tout fonctionnait, parce que c'est le
 * script d'amorçage du `<head>` qui repose l'état depuis `localStorage` :
 * le défaut ne se voyait qu'à la première visite, c'est-à-dire chez la
 * totalité du trafic publicitaire.
 *
 * C'est exactement le piège déjà rencontré pour les événements du tunnel
 * (voir `events.ts`), resté ici.
 *
 * ═══ Et GTM reste compatible ═══
 *
 * `gtag()` est défini par les deux amorçages — celui de GTM comme celui
 * de GA4 direct — et se contente de pousser son objet `arguments` dans le
 * `dataLayer`. C'est la seule forme que **les deux** comprennent. Le
 * `push` d'origine ne subsiste qu'en secours, pour le cas improbable d'un
 * `dataLayer` sans `gtag`.
 */
export function pushConsentUpdate(choice: ConsentChoice) {
  const mesure = choice.analytics ? "granted" : "denied";
  const publicite = choice.marketing ? "granted" : "denied";

  const signaux = {
    analytics_storage: mesure,
    ad_storage: publicite,
    ad_user_data: publicite,
    ad_personalization: publicite,
  };

  const fenetre = window as unknown as {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  };

  if (typeof fenetre.gtag === "function") {
    fenetre.gtag("consent", "update", signaux);
    return;
  }

  if (Array.isArray(fenetre.dataLayer)) {
    fenetre.dataLayer.push({ 0: "consent", 1: "update", 2: signaux, length: 3 });
  }
}
