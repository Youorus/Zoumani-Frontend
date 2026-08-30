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
  // ── La visite ──
  //
  // Ce qu'on cherche à savoir : combien arrivent, combien lisent, et où
  // ils s'arrêtent. La profondeur de défilement et le temps passé sont
  // les deux seules mesures qui distinguent un visiteur d'un rebond
  // quand personne ne clique.
  landingViewed: "landing_viewed",
  scrollDepth: "scroll_depth",
  timeOnPage: "time_on_page",
  sectionViewed: "section_viewed",
  ctaClicked: "cta_clicked",
  pageView: "page_view",

  // ── Le tunnel de pré-lancement ──
  //
  // Les noms suivent la nomenclature arrêtée avec Marc. Ils ont été
  // renommés depuis `prelaunch_lead_*` : le coût était nul, aucune
  // donnée n'ayant encore été collectée — le conteneur GTM ne portait
  // aucune balise. Renommer plus tard aurait coupé l'historique en deux.
  //
  // `*_started` et `*_completed` vont par paires : c'est l'écart entre
  // les deux qui dit où l'on abandonne, et un tunnel qui ne mesure que
  // les réussites ne dit jamais pourquoi il fuit.
  prelaunchView: "prelaunch_view",
  intentSelected: "intent_selected",
  senderSelected: "sender_selected",
  travelerSelected: "traveler_selected",
  routeStarted: "route_started",
  routeCompleted: "route_completed",
  timingCompleted: "timing_completed",
  detailsCompleted: "details_completed",
  contactStarted: "contact_started",
  prelaunchSubmit: "prelaunch_submit",
  /** L'événement de conversion. C'est celui à marquer « key event » dans GA4. */
  prelaunchSuccess: "prelaunch_success",
  prelaunchError: "prelaunch_error",
} as const;

/**
 * Ce qui ne doit jamais partir vers une régie de mesure.
 *
 * La règle est simple à énoncer et facile à enfreindre : un jour
 * quelqu'un ajoutera `email` au contexte d'un événement pour déboguer, et
 * l'oubliera. Le filtre est donc posé **au seul endroit par lequel tout
 * passe**, plutôt que confié à la vigilance de chaque appel.
 *
 * Il retire la clé et, en développement, le dit bruyamment — un filtre
 * silencieux masquerait la faute au lieu de la corriger.
 */
const INTERDITS = new Set([
  "email",
  "phone",
  "tel",
  "telephone",
  "first_name",
  "firstName",
  "last_name",
  "lastName",
  "name",
  "full_name",
  "address",
  "ip",
  "user_id",
  "password",
  "document",
  "id_document",
]);

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];
export type EventParams = Record<string, string | number | boolean | undefined>;

/**
 * Signale un événement.
 *
 * N'échoue jamais : une erreur de mesure ne doit pas interrompre une
 * inscription. C'est le sens de la hiérarchie — on collecte pour
 * comprendre, on n'empêche pas pour mesurer.
 */
/**
 * Y a-t-il un conteneur GTM ?
 *
 * Lu à la compilation, comme la règle de chargement : les deux décisions
 * doivent être prises sur la même valeur, sans quoi on émettrait dans une
 * convention que personne n'écoute.
 */
const GTM_ACTIF = Boolean(process.env.NEXT_PUBLIC_GTM_ID);

export function track(event: EventName, params: EventParams = {}) {
  if (typeof window === "undefined") return;

  const propre: EventParams = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === "") continue;
    if (INTERDITS.has(k)) {
      if (process.env.NODE_ENV === "development") {
        console.error(
          `[mesure] « ${k} » est une donnée personnelle et n'a pas été envoyée ` +
            `avec « ${event} ». Retirez-la de l'appel plutôt que de compter sur ce filtre.`,
        );
      }
      continue;
    }
    propre[k] = v;
  }

  // ═══ Deux conventions, et elles ne sont pas interchangeables ═══
  //
  // Pousser `{ event: "prelaunch_success", ... }` dans le `dataLayer` est
  // la convention de **Google Tag Manager** : le conteneur y reconnaît un
  // événement personnalisé et déclenche ce qui l'écoute.
  //
  // `gtag.js` chargé seul **ignore** cette forme. Il ne lit du `dataLayer`
  // que les appels de la forme `gtag('event', nom, params)`. C'est ce qui
  // faisait que les treize événements du tunnel restaient dans la couche
  // sans jamais atteindre GA4 : seuls `page_view` et les événements
  // collectés d'office arrivaient, et le tunnel paraissait muet alors
  // qu'il parlait dans le vide.
  //
  // Le choix suit la même règle que le chargement : GTM l'emporte quand
  // il est configuré, et lui seul reçoit. Sinon, on s'adresse à `gtag`.
  // Faire les deux exposerait au double comptage le jour où un conteneur
  // GTM porterait aussi une balise GA4.
  const fenetre = window as unknown as {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  };

  if (!GTM_ACTIF && typeof fenetre.gtag === "function") {
    fenetre.gtag("event", event, propre);
    return;
  }

  if (Array.isArray(fenetre.dataLayer)) {
    fenetre.dataLayer.push({ event, ...propre });
    return;
  }

  if (process.env.NODE_ENV === "development") {
    console.info("[mesure]", event, propre);
  }
}

/**
 * Un changement de page.
 *
 * Le site est une application à navigation client : passer de l'accueil
 * à `/preinscription` ne recharge pas le document, et GA4 ne voit donc
 * aucune nouvelle page. Sans cet appel, tout le trafic serait attribué à
 * la première page ouverte.
 */
export function page(path: string, title?: string) {
  track(EVENTS.pageView, { page_path: path, page_title: title });
}

/**
 * La façade de mesure.
 *
 * Elle existe pour qu'aucun composant n'appelle `gtag` ni ne pousse dans
 * le `dataLayer` lui-même : le jour où l'on change de régie, c'est
 * `track` qu'on modifie, et rien d'autre.
 *
 * ═══ Pourquoi il n'y a pas d'`identify` ═══
 *
 * Il n'y a personne à identifier. Le site n'a pas de comptes — la
 * pré-inscription enregistre une intention, pas un utilisateur. Une
 * fonction `identify` ne pourrait aujourd'hui transmettre qu'un e-mail
 * ou un téléphone, c'est-à-dire exactement ce que le filtre ci-dessus
 * interdit. Elle s'ajoutera le jour où il existera un identifiant de
 * compte, qui n'est pas une donnée personnelle en soi.
 */
export const analytics = { track, page } as const;
