/**
 * Le parcours d'un colis, tel que le serveur le décrit.
 *
 * ═══ Six étapes, et deux lectures ═══
 *
 * Le transporteur en publie trente-cinq ; l'API n'en expose que six, parce
 * que chacune répond à la seule question qu'on se pose vraiment : est-ce
 * que quelqu'un attend quelque chose de moi ?
 *
 * Le **texte de l'action vient du serveur**, déjà choisi pour celui qui
 * regarde. À l'arrivée au point relais, le voyageur lit « retirez-le sous
 * 24 heures » et l'expéditeur « votre colis attend le voyageur ». Le
 * recomposer ici obligerait à savoir qui l'on est, et un client qui se
 * trompe dit à l'expéditeur d'aller chercher le colis qu'il vient
 * d'envoyer.
 *
 * ═══ Ce que l'interface décide, malgré tout ═══
 *
 * L'ordre d'affichage, l'icône et la couleur. Ce sont des choix visuels,
 * pas du métier — les faire porter par l'API l'obligerait à connaître le
 * design.
 */

/** Où en est le colis, selon le serveur. */
export type JourneyStep =
  | "awaiting_meeting"
  | "awaiting_dropoff"
  | "dropped_off"
  | "in_transit"
  | "awaiting_pickup"
  | "handed_over"
  | "collected"
  | "incident";

/** Une étape franchie, datée. */
export interface JourneyEvent {
  step: JourneyStep;
  occurredAt: string;
  detail: string;
}

/** Le suivi d'un colis, du point de vue de celui qui le consulte. */
export interface Journey {
  id: string;
  shipmentId: string;
  step: JourneyStep;
  /** Vrai si l'appelant expédie. Sert au vocabulaire, jamais à un droit. */
  isSender: boolean;
  /** Ce que **cette** personne a à faire, ou à attendre. Vient du serveur. */
  action: string;
  history: JourneyEvent[];
  /** Échéance de retrait, quand le colis attend au relais du voyageur. */
  deadlineAt: string | null;
}

export interface RawJourneyEvent {
  step: JourneyStep;
  occurred_at: string;
  detail?: string;
}

export interface RawJourney {
  id: string;
  shipment_id: string;
  step: JourneyStep;
  is_sender: boolean;
  action: string;
  history: RawJourneyEvent[];
  deadline_at: string | null;
}

export function toJourney(raw: RawJourney): Journey {
  return {
    id: raw.id,
    shipmentId: raw.shipment_id,
    step: raw.step,
    isSender: raw.is_sender,
    action: raw.action,
    history: (raw.history ?? []).map((event) => ({
      step: event.step,
      occurredAt: event.occurred_at,
      detail: event.detail ?? "",
    })),
    deadlineAt: raw.deadline_at,
  };
}

/**
 * L'ordre d'affichage de la frise, par parcours.
 *
 * Deux parcours qui ne se croisent jamais : celui du transporteur et celui
 * de la main propre, qui n'a que deux étapes. Le mode est figé au
 * paiement, donc une frise ne mélange jamais les deux.
 *
 * `incident` n'y figure pas : il ne s'insère nulle part, il remplace.
 */
const CARRIER_TRACK: JourneyStep[] = [
  "awaiting_dropoff",
  "dropped_off",
  "in_transit",
  "awaiting_pickup",
  "collected",
];

const IN_PERSON_TRACK: JourneyStep[] = ["awaiting_meeting", "handed_over"];

/** La frise à dessiner pour ce parcours-ci. */
export function trackFor(step: JourneyStep): JourneyStep[] {
  return IN_PERSON_TRACK.includes(step) ? IN_PERSON_TRACK : CARRIER_TRACK;
}

/** Libellé court d'une étape, pour la frise. */
export const STEP_LABELS: Record<JourneyStep, string> = {
  awaiting_meeting: "Rendez-vous à convenir",
  awaiting_dropoff: "À déposer",
  dropped_off: "Déposé",
  in_transit: "En route",
  awaiting_pickup: "À retirer",
  handed_over: "Remis en main propre",
  collected: "Retiré par le voyageur",
  incident: "Incident",
};

/** Où en est une étape par rapport à celle en cours. */
export type StepState = "done" | "current" | "todo";

export function stateOf(step: JourneyStep, current: JourneyStep): StepState {
  const track = trackFor(current);
  const position = track.indexOf(step);
  const atteinte = track.indexOf(current);
  if (position < 0 || atteinte < 0) {
    return "todo";
  }
  if (position < atteinte) {
    return "done";
  }
  return position === atteinte ? "current" : "todo";
}

/** Le colis a-t-il rencontré un problème ? */
export function isIncident(step: JourneyStep): boolean {
  return step === "incident";
}

/**
 * L'étiquette est-elle à imprimer par celui qui regarde ?
 *
 * Seulement l'expéditeur, et seulement tant que le colis n'est pas parti.
 * Après le dépôt, proposer un téléchargement laisse croire qu'il reste
 * quelque chose à faire.
 */
export function needsLabel(journey: Journey): boolean {
  return journey.isSender && journey.step === "awaiting_dropoff";
}
