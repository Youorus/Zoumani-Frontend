import type { Intention, LeadDraft, Timing } from "../api/prelaunch-api";

/**
 * L'état du tunnel, et sa conservation.
 *
 * ═══ Des fonctions pures, hors de React ═══
 *
 * Chacune prend des données et rend une décision. Elles s'éprouvent donc
 * sans monter un composant — et c'est ce qui permet de tester la règle
 * « un contact suffit » sans simuler une frappe au clavier.
 *
 * ═══ Pourquoi l'état survit au retour en arrière ═══
 *
 * Quelqu'un qui recule pour corriger sa ville, puis avance, ne doit pas
 * retrouver un formulaire vide. On recommence une fois, pas deux.
 *
 * `sessionStorage` et non `localStorage` : l'inscription vaut pour cette
 * visite. Retrouver un brouillon vieux de trois semaines poserait deux
 * questions désagréables — « ai-je déjà validé ? » et « est-ce encore
 * vrai ? ».
 */

export type Step = "route" | "timing" | "details" | "contact";

export const STEPS: readonly Step[] = ["route", "timing", "details", "contact"];

export type FunnelState = {
  intention: Intention | null;
  originCity: string;
  /** Rempli seulement quand la ville vient d'une suggestion. Vide pour une
   *  saisie libre — mieux vaut une ville sans pays qu'un pays deviné. */
  originCountry: string;
  destinationCity: string;
  destinationCountry: string;
  timing: Timing;
  travelOn: string;
  parcelKind: string;
  weightBracket: string;
  firstName: string;
  email: string;
  phone: string;
  consent: boolean;
};

export const EMPTY_FUNNEL: FunnelState = {
  intention: null,
  originCity: "",
  originCountry: "",
  destinationCity: "",
  destinationCountry: "",
  timing: "asap",
  travelOn: "",
  parcelKind: "",
  weightBracket: "",
  firstName: "",
  email: "",
  phone: "",
  consent: false,
};

const KEY = "zoumani.prelaunch.draft";

/** Relit le brouillon. Rend l'état vide plutôt que de lever : un stockage
 *  refusé ne doit pas empêcher de s'inscrire. */
export function readDraft(): FunnelState {
  if (typeof window === "undefined") return EMPTY_FUNNEL;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? { ...EMPTY_FUNNEL, ...(JSON.parse(raw) as Partial<FunnelState>) } : EMPTY_FUNNEL;
  } catch {
    return EMPTY_FUNNEL;
  }
}

export function writeDraft(state: FunnelState) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* Navigation privée, quota : on continue sans mémoire. */
  }
}

export function clearDraft() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* Idem. */
  }
}

/** Le trajet est-il exploitable ? La seule donnée qui ne se devine pas
 *  après coup, et celle qui dit où ouvrir. */
export function routeIsComplete(state: FunnelState): boolean {
  return state.originCity.trim().length > 1 && state.destinationCity.trim().length > 1;
}

/**
 * Un contact utilisable ?
 *
 * L'un des deux suffit. La vérification de l'e-mail reste volontairement
 * grossière : refuser une adresse valide mais inhabituelle coûte une
 * inscription, alors qu'une adresse fautive coûte un message non
 * distribué. On écarte l'évidence, rien de plus.
 */
export function contactIsUsable(state: FunnelState): boolean {
  const emailLooksRight = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(state.email.trim());
  const phoneLooksRight = state.phone.replace(/\D/g, "").length >= 8;
  return emailLooksRight || phoneLooksRight;
}

export function canSubmit(state: FunnelState): boolean {
  return (
    state.intention !== null &&
    routeIsComplete(state) &&
    state.firstName.trim().length > 0 &&
    contactIsUsable(state) &&
    state.consent
  );
}

/** Traduit l'état de l'écran en ce que le serveur attend. */
export function toLeadDraft(state: FunnelState): LeadDraft {
  if (state.intention === null) {
    throw new Error("Aucune intention choisie.");
  }
  return {
    intention: state.intention,
    firstName: state.firstName,
    origin: { city: state.originCity, countryCode: state.originCountry || undefined },
    destination: {
      city: state.destinationCity,
      countryCode: state.destinationCountry || undefined,
    },
    email: state.email,
    phone: state.phone,
    timing: state.timing,
    travelOn: state.travelOn || undefined,
    parcelKind: state.parcelKind || undefined,
    weightBracket: state.weightBracket || undefined,
    consent: state.consent,
  };
}
