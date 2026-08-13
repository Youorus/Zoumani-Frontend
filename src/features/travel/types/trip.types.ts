/**
 * Le voyage tel que l'API le rend, et tel que l'interface le manipule.
 *
 * Comme pour la capacité, la traduction `snake_case` → `camelCase` se
 * fait **ici, une fois**. Deux conversions divergeraient, et l'un des
 * écrans finirait par afficher un statut périmé.
 */

/**
 * Les neuf états d'un voyage.
 *
 * Ils décrivent une machine, mais un voyageur n'a pas à la connaître :
 * `stageOfTrip` les ramène à quatre situations qui répondent à sa seule
 * question — « qu'est-ce que je dois faire ? ».
 */
export type TripStatus =
  | "draft"
  | "pending_automatic_verification"
  | "pending_manual_review"
  | "action_required"
  | "verified"
  | "rejected"
  | "cancelled"
  | "expired"
  | "completed";

/**
 * Ce que le voyageur doit comprendre, réduit à quatre cas.
 *
 * - `brouillon` : à lui de jouer, rien n'est transmis ;
 * - `en_attente` : nous travaillons, il n'a rien à faire ;
 * - `a_corriger` : la balle est dans son camp ;
 * - `clos` : plus rien n'en sortira.
 *
 * Quatre situations plutôt que neuf statuts : « en vérification
 * automatique » et « en examen manuel » demandent la même chose au
 * voyageur — attendre — et les distinguer à l'écran ne lui apprendrait
 * qu'un détail de notre organisation.
 */
export type TripStage = "brouillon" | "en_attente" | "a_corriger" | "clos";

export function stageOfTrip(status: TripStatus): TripStage {
  switch (status) {
    case "draft":
      return "brouillon";
    case "action_required":
      return "a_corriger";
    case "rejected":
    case "cancelled":
    case "expired":
    case "completed":
      return "clos";
    default:
      // `pending_automatic_verification`, `pending_manual_review`,
      // `verified` : dans les trois cas, rien à faire de son côté.
      return "en_attente";
  }
}

export interface TripSegment {
  segmentOrder: number;
  airlineCode: string;
  flightNumber: string;
  originAirportCode: string;
  destinationAirportCode: string;
  departureAt: string;
  arrivalAt: string;
}

export interface Trip {
  id: string;
  status: TripStatus;
  stage: TripStage;
  originAirportCode: string;
  destinationAirportCode: string;
  departureAt: string;
  arrivalAt: string;
  segments: TripSegment[];
  rejectionReason: string | null;
  correctionNote: string | null;
  /** L'itinéraire peut-il encore changer ? Décidé par le serveur. */
  isEditable: boolean;
  /** Le voyage peut-il porter une offre visible ? */
  canCarryOffer: boolean;
  createdAt: string;
  verifiedAt: string | null;
}

export interface RawTripSegment {
  segment_order: number;
  airline_code: string;
  flight_number: string;
  origin_airport_code: string;
  destination_airport_code: string;
  departure_at: string;
  arrival_at: string;
}

export interface RawTrip {
  id: string;
  status: TripStatus;
  origin_airport_code: string;
  destination_airport_code: string;
  departure_at: string;
  arrival_at: string;
  segments: RawTripSegment[];
  rejection_reason: string | null;
  correction_note: string | null;
  is_editable: boolean;
  can_carry_offer: boolean;
  created_at: string;
  verified_at: string | null;
}

export interface RawPage<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export function toTrip(raw: RawTrip): Trip {
  return {
    id: raw.id,
    status: raw.status,
    stage: stageOfTrip(raw.status),
    originAirportCode: raw.origin_airport_code,
    destinationAirportCode: raw.destination_airport_code,
    departureAt: raw.departure_at,
    arrivalAt: raw.arrival_at,
    segments: raw.segments.map((segment) => ({
      segmentOrder: segment.segment_order,
      airlineCode: segment.airline_code,
      flightNumber: segment.flight_number,
      originAirportCode: segment.origin_airport_code,
      destinationAirportCode: segment.destination_airport_code,
      departureAt: segment.departure_at,
      arrivalAt: segment.arrival_at,
    })),
    rejectionReason: raw.rejection_reason,
    correctionNote: raw.correction_note,
    isEditable: raw.is_editable,
    canCarryOffer: raw.can_carry_offer,
    createdAt: raw.created_at,
    verifiedAt: raw.verified_at,
  };
}

// ─── Les preuves de billet ─────────────────────────────────────────────

/**
 * Nature du document fourni.
 *
 * Le niveau de preuve n'est pas le même selon le document : une carte
 * d'embarquement atteste d'un enregistrement effectif, une confirmation
 * de réservation seulement d'une intention payée. L'écran le dit, parce
 * que déposer le bon document accélère la vérification.
 */
export type ProofKind = "e_ticket" | "boarding_pass" | "booking_confirmation";

export type ProofStatus = "uploaded" | "accepted" | "rejected" | "replaced";

export interface Proof {
  id: string;
  kind: ProofKind;
  status: ProofStatus;
  rejectionReason: string | null;
  createdAt: string;
}

export interface RawProof {
  id: string;
  kind: ProofKind;
  status: ProofStatus;
  rejection_reason: string | null;
  created_at: string;
}

export function toProof(raw: RawProof): Proof {
  return {
    id: raw.id,
    kind: raw.kind,
    status: raw.status,
    rejectionReason: raw.rejection_reason,
    createdAt: raw.created_at,
  };
}

// ─── Le programme de fidélité ──────────────────────────────────────────

export interface Tier {
  code: string;
  name: string;
  threshold: number;
  perks: string[];
}

export interface PointEntry {
  reason: string;
  amount: number;
  occurredAt: string;
  note: string | null;
}

export interface Rewards {
  balance: number;
  tier: Tier;
  nextTier: Tier | null;
  /** Ce qu'il reste à gagner. `null` au sommet. */
  pointsToNext: number | null;
  /** Entre 0 et 1, mesuré depuis le palier courant. Calculé par le serveur. */
  progress: number;
  history: PointEntry[];
  allTiers: Tier[];
}

export interface RawRewards {
  balance: number;
  tier: Tier;
  next_tier: Tier | null;
  points_to_next: number | null;
  progress: number;
  history: { reason: string; amount: number; occurred_at: string; note: string | null }[];
  all_tiers: Tier[];
}

export function toRewards(raw: RawRewards): Rewards {
  return {
    balance: raw.balance,
    tier: raw.tier,
    nextTier: raw.next_tier,
    pointsToNext: raw.points_to_next,
    progress: raw.progress,
    history: raw.history.map((entry) => ({
      reason: entry.reason,
      amount: entry.amount,
      occurredAt: entry.occurred_at,
      note: entry.note,
    })),
    allTiers: raw.all_tiers,
  };
}

// ─── La recherche d'un expéditeur ──────────────────────────────────────

export interface TravelerCard {
  /** Prénom et initiale. **Jamais** l'identité complète. */
  displayName: string;
  photoUrl: string | null;
}

export interface CapacityMatch {
  capacityId: string;
  tripId: string;
  traveler: TravelerCard;
  origin: string;
  destination: string;
  departureAt: string;
  availableWeightKg: number;
  currency: string;
  offers: { categoryCode: string; priceMajor: string; perPiece: boolean }[];
  /** `null` quand l'une des deux adresses n'a pas pu être située. */
  distanceMeters: number | null;
}

export interface RawCapacityMatch {
  capacity_id: string;
  trip_id: string;
  traveler: { display_name: string; photo_url: string | null };
  origin: string;
  destination: string;
  departure_at: string;
  available_weight_kg: number;
  currency: string;
  offers: { category_code: string; price_major: string; per_piece: boolean }[];
  distance_meters: number | null;
}

export function toCapacityMatch(raw: RawCapacityMatch): CapacityMatch {
  return {
    capacityId: raw.capacity_id,
    tripId: raw.trip_id,
    traveler: {
      displayName: raw.traveler.display_name,
      photoUrl: raw.traveler.photo_url,
    },
    origin: raw.origin,
    destination: raw.destination,
    departureAt: raw.departure_at,
    availableWeightKg: raw.available_weight_kg,
    currency: raw.currency,
    offers: raw.offers.map((offer) => ({
      categoryCode: offer.category_code,
      priceMajor: offer.price_major,
      perPiece: offer.per_piece,
    })),
    distanceMeters: raw.distance_meters,
  };
}

/**
 * Met une distance en mots utiles.
 *
 * Sous le kilomètre, on arrondit à la centaine de mètres : « 800 m »
 * veut dire quelque chose, « 843 m » donne une précision que le
 * géocodage ne porte pas. Au-delà de dix kilomètres, l'unité entière
 * suffit — personne ne décide sur 300 mètres à cette échelle.
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters / 100) * 100} m`;
  }
  const km = meters / 1000;
  return km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`;
}
