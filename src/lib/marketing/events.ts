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
 * ═══ Trois régies, un seul point de sortie ═══
 *
 * GA4 reçoit tout. Meta ne reçoit que la conversion — la traduction est
 * plus bas, dans `META_STANDARD`, et l'envoi dans `meta.ts`. Clarity
 * n'écoute pas les événements : il rejoue l'écran, et se charge ailleurs.
 *
 * Aucune ne peut être appelée depuis un composant. C'est ce qui garantit
 * qu'un événement nouveau part partout, avec le même nom et le même
 * filtre — ou nulle part, si le consentement manque.
 */

import { metaTrack } from "./meta";

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
  /**
   * L'arrivée sur une étape, par opposition à son franchissement.
   *
   * ═══ Pourquoi il manquait, et ce qu'on ne voyait pas ═══
   *
   * Le tunnel n'émettait que des `*_completed`. On savait donc combien de
   * personnes franchissaient une étape, jamais combien l'avaient vue —
   * et l'abandon **à l'intérieur** d'une étape restait invisible.
   * Quelqu'un qui atteint le formulaire de contact et s'arrête devant la
   * case de consentement ne se distinguait pas de quelqu'un qui n'y était
   * jamais arrivé.
   *
   * Il est émis **à chaque affichage** d'une étape, retour en arrière
   * compris : c'est ce qui se passe réellement, et une étape revue est un
   * signal en soi — on y hésite.
   */
  funnelStepViewed: "funnel_step_viewed",
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
 * Le paramètre qui ne part que vers Meta.
 *
 * Il porte l'identifiant de déduplication d'un événement — celui de la
 * préinscription rendu par le serveur. GA4 n'en a aucun usage, et
 * envoyer un identifiant d'enregistrement à une régie de mesure qui ne
 * s'en sert pas n'a pas de raison d'être. Il est donc retiré des
 * paramètres avant l'envoi à GA4, et transmis à Meta comme `eventID`.
 */
export const PARAM_EVENT_ID = "event_id";

/**
 * Ce que Meta doit recevoir, et à quel moment.
 *
 * ═══ Un seul événement standard ═══
 *
 * `Lead`, sur la confirmation du serveur — pas sur l'envoi du
 * formulaire. Un « lead » qui n'a pas été enregistré n'est pas un lead,
 * et compter les tentatives ferait croire à une conversion là où il y a
 * eu une erreur réseau.
 *
 * `PageView` n'est pas ici : il appartient au cycle de vie du pixel
 * lui-même, qui l'émet au chargement puis à chaque changement de route.
 *
 * Les autres étapes du tunnel ne partent pas vers Meta. Sur un test à
 * 25 €, aucune n'atteindra le volume qui permettrait à Meta d'optimiser
 * dessus : les envoyer ne ferait qu'ajouter des requêtes réseau et de la
 * donnée personnelle en circulation, sans rien apprendre.
 */
const META_STANDARD: Partial<Record<EventName, "Lead">> = {
  [EVENTS.prelaunchSuccess]: "Lead",
};

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

  const brut = params[PARAM_EVENT_ID];
  const eventId = typeof brut === "string" && brut ? brut : undefined;

  const propre: EventParams = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === "") continue;
    if (k === PARAM_EVENT_ID) continue;
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
  } else if (Array.isArray(fenetre.dataLayer)) {
    fenetre.dataLayer.push({ event, ...propre });
  } else if (process.env.NODE_ENV === "development") {
    console.info("[mesure]", event, propre);
  }

  // ═══ Puis Meta, pour les rares événements qui l'intéressent ═══
  //
  // Après GA4, et jamais à sa place : c'est GA4 qui porte le tunnel
  // complet. Meta ne reçoit que la conversion, parce que c'est la seule
  // chose sur laquelle il sache optimiser.
  //
  // `metaTrack` ne fait rien tant que le pixel n'est pas chargé, donc
  // rien tant que le consentement publicitaire n'a pas été donné. Le
  // filtre des données personnelles a déjà été appliqué au-dessus : ce
  // qui part vers Meta a traversé le même tamis que ce qui part vers
  // GA4.
  const standard = META_STANDARD[event];
  if (standard) {
    metaTrack(
      standard,
      {
        // Meta n'a pas de dimension « versant du marché ». Sa convention
        // pour cela est `content_category`, que l'on retrouve dans ses
        // rapports et dans les audiences.
        content_category: typeof propre.intent_role === "string" ? propre.intent_role : "unknown",
      },
      eventId,
    );
  }
}

/**
 * Un changement de page.
 *
 * ═══ Elle n'est pas appelée, et c'est délibéré ═══
 *
 * Le site est une application à navigation client, et il paraît donc
 * évident que GA4 ne voit qu'une page par visite. C'est faux : sa
 * « mesure améliorée » suit les changements d'historique et envoie le
 * `page_view` au premier signal d'engagement qui suit la navigation.
 * Vérifié le 4 septembre 2026 — voir `analytics-runtime.tsx`, qui porte
 * la mesure et les chiffres.
 *
 * L'appeler en plus produirait **deux** `page_view` pour une seule page.
 *
 * Elle reste exportée parce que la chose dépend d'un réglage de la
 * propriété GA4, que quelqu'un peut désactiver : le jour où les
 * navigations cesseraient d'apparaître dans les rapports, il suffirait
 * de la rebrancher dans `AnalyticsRuntime`. Sa suppression obligerait à
 * la réécrire, et à retrouver pourquoi.
 */
export function page(path: string, title?: string) {
  // `page_location` en plus de `page_path` : c'est celui dont GA4 dérive
  // la dimension « chemin de page ». Sans lui, la balise retomberait sur
  // `document.location` — juste, mais seulement tant que l'appel suit
  // immédiatement le changement d'URL. Le poser explicitement rend
  // l'événement lisible hors de son contexte d'émission.
  const origine = typeof window === "undefined" ? "" : window.location.origin;
  track(EVENTS.pageView, {
    page_path: path,
    page_location: origine ? `${origine}${path}` : undefined,
    page_title: title,
  });
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
