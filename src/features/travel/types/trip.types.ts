import type { Capacity } from "./travel.types";
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
  /** Barème rendu par le serveur : aucune valeur commerciale n'est recopiée ici. */
  earningRules: Record<string, number>;
}

export interface RawRewards {
  balance: number;
  tier: Tier;
  next_tier: Tier | null;
  points_to_next: number | null;
  progress: number;
  history: { reason: string; amount: number; occurred_at: string; note: string | null }[];
  all_tiers: Tier[];
  earning_rules: Record<string, number>;
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
    earningRules: raw.earning_rules,
  };
}

// ─── La recherche d'un expéditeur ──────────────────────────────────────

export interface TravelerCard {
  /** Prénom et initiale. **Jamais** l'identité complète. */
  displayName: string;
  photoUrl: string | null;
  rewardPoints: number;
}

export interface CapacityMatch {
  capacityId: string;
  tripId: string;
  traveler: TravelerCard;
  origin: string;
  originCity: string;
  originCountry: string;
  destination: string;
  destinationCity: string;
  destinationCountry: string;
  departureAt: string;
  availableWeightKg: number;
  currency: string;
  /** Ce voyageur va-t-il chercher un colis en point relais ? */
  acceptsPickup: boolean;
  offers: { categoryCode: string; priceMajor: string; perPiece: boolean }[];
  /** `null` quand l'une des deux adresses n'a pas pu être située. */
  distanceMeters: number | null;
}

export interface RawCapacityMatch {
  capacity_id: string;
  trip_id: string;
  traveler: { display_name: string; photo_url: string | null; reward_points: number };
  origin: string;
  origin_city: string;
  origin_country: string;
  destination: string;
  destination_city: string;
  destination_country: string;
  departure_at: string;
  available_weight_kg: number;
  currency: string;
  accepts_pickup: boolean;
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
      rewardPoints: raw.traveler.reward_points,
    },
    origin: raw.origin,
    originCity: raw.origin_city,
    originCountry: raw.origin_country,
    destination: raw.destination,
    destinationCity: raw.destination_city,
    destinationCountry: raw.destination_country,
    departureAt: raw.departure_at,
    availableWeightKg: raw.available_weight_kg,
    currency: raw.currency,
    acceptsPickup: raw.accepts_pickup,
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

// ─── L'expédition ──────────────────────────────────────────────────────

export type ShipmentStatus = "draft" | "pending_payment" | "confirmed" | "cancelled";
export type HandoverMethod = "in_person" | "carrier";

export interface ParcelLine {
  categoryCode: string;
  /** Décidé par l'offre du voyageur, jamais par l'expéditeur. */
  perPiece: boolean;
  quantityKg: number | null;
  pieces: number | null;
  unitPriceMinor: number;
  totalMinor: number;
  hasPhoto: boolean;
}

export interface ShipmentSummary {
  id: string;
  capacityId: string;
  status: ShipmentStatus;
  handover: HandoverMethod;
  servicePointCode: string | null;
  carrierCode: string | null;
  currency: string;
  lines: ParcelLine[];
  /** Ce qui revient au voyageur. Ni commission, ni assurance, ni transport. */
  totalMinor: number;
  totalMajor: string;
  weightKg: number;
  isEditable: boolean;
}

export interface RawShipment {
  id: string;
  capacity_id: string;
  status: ShipmentStatus;
  handover: HandoverMethod;
  service_point_code: string | null;
  carrier_code: string | null;
  currency: string;
  lines: {
    category_code: string;
    per_piece: boolean;
    quantity_kg: number | null;
    pieces: number | null;
    unit_price_minor: number;
    total_minor: number;
    has_photo: boolean;
  }[];
  total_minor: number;
  total_major: string;
  weight_kg: number;
  is_editable: boolean;
}

export function toShipment(raw: RawShipment): ShipmentSummary {
  return {
    id: raw.id,
    capacityId: raw.capacity_id,
    status: raw.status,
    handover: raw.handover,
    servicePointCode: raw.service_point_code,
    carrierCode: raw.carrier_code,
    currency: raw.currency,
    lines: raw.lines.map((line) => ({
      categoryCode: line.category_code,
      perPiece: line.per_piece,
      quantityKg: line.quantity_kg,
      pieces: line.pieces,
      unitPriceMinor: line.unit_price_minor,
      totalMinor: line.total_minor,
      hasPhoto: line.has_photo,
    })),
    totalMinor: raw.total_minor,
    totalMajor: raw.total_major,
    weightKg: raw.weight_kg,
    isEditable: raw.is_editable,
  };
}

/**
 * Le coût d'une ligne, calculé **pour l'affichage seul**.
 *
 * Le serveur reste la référence : c'est son total qui est facturé. Cette
 * estimation existe pour que le chiffre bouge pendant qu'on tape, sans
 * un aller-retour par frappe — un prix qui n'apparaît qu'après validation
 * fait hésiter, et l'hésitation fait abandonner.
 */
export function estimateLineMinor(
  unitPriceMinor: number,
  quantity: number,
  perPiece: boolean,
): number {
  if (perPiece) {
    return unitPriceMinor * quantity;
  }
  // Au prorata, comme le domaine : 500 g à 8 €/kg font 4 €.
  return Math.round((unitPriceMinor * quantity) / 1000);
}

// ─── La remise du colis ────────────────────────────────────────────────

export type HandoverAdvice = "in_person_only" | "either" | "carrier_recommended";
export type ServicePointOutcome = "found" | "none_nearby" | "unavailable";

export interface ServicePoint {
  code: string;
  name: string;
  carrier: string;
  carrierName: string;
  street: string;
  postalCode: string;
  city: string;
  latitude: number;
  longitude: number;
  distanceMeters: number | null;
  openingTimes: string[];
}

export interface CarrierQuote {
  carrier: string;
  label: string;
  /** L'acheminement jusqu'au relais. */
  shippingMinor: number;
  /** Le dédommagement du voyageur qui va l'y chercher. */
  pickupMinor: number;
  /** La somme des deux. */
  priceMinor: number;
  priceMajor: string;
}

export interface HandoverOptions {
  advice: HandoverAdvice;
  distanceMeters: number | null;
  quotes: CarrierQuote[];
  /** `unavailable` n'est **pas** « aucun point » : voir l'API. */
  pointsOutcome: ServicePointOutcome;
  servicePoints: ServicePoint[];
}

export interface RawHandoverOptions {
  advice: HandoverAdvice;
  distance_meters: number | null;
  quotes: {
    carrier: string;
    label: string;
    shipping_minor: number;
    pickup_minor: number;
    price_minor: number;
    price_major: string;
  }[];
  points_outcome: ServicePointOutcome;
  service_points: {
    code: string;
    name: string;
    carrier: string;
    carrier_name: string;
    street: string;
    postal_code: string;
    city: string;
    latitude: number;
    longitude: number;
    distance_meters: number | null;
    opening_times: string[];
  }[];
}

export function toHandoverOptions(raw: RawHandoverOptions): HandoverOptions {
  return {
    advice: raw.advice,
    distanceMeters: raw.distance_meters,
    quotes: raw.quotes.map((quote) => ({
      carrier: quote.carrier,
      label: quote.label,
      shippingMinor: quote.shipping_minor,
      pickupMinor: quote.pickup_minor,
      priceMinor: quote.price_minor,
      priceMajor: quote.price_major,
    })),
    pointsOutcome: raw.points_outcome,
    servicePoints: raw.service_points.map((point) => ({
      code: point.code,
      name: point.name,
      carrier: point.carrier,
      carrierName: point.carrier_name,
      street: point.street,
      postalCode: point.postal_code,
      city: point.city,
      latitude: point.latitude,
      longitude: point.longitude,
      distanceMeters: point.distance_meters,
      openingTimes: point.opening_times,
    })),
  };
}

/**
 * Le drapeau d'un pays, depuis son code ISO.
 *
 * Composé d'indicateurs régionaux Unicode : aucune image à charger, et
 * le rendu suit la police du système. Un drapeau se reconnaît plus vite
 * qu'un nom de pays sur une carte qu'on parcourt du regard.
 */
export function flagOf(countryCode: string): string {
  if (countryCode.length !== 2) {
    return "";
  }
  return String.fromCodePoint(
    ...[...countryCode.toUpperCase()].map(
      (lettre) => 0x1f1e6 + lettre.charCodeAt(0) - 65,
    ),
  );
}

/**
 * Une offre consultée par un expéditeur, ramenée à la forme `Capacity`.
 *
 * La route publique rend un **résultat de recherche** — offre, voyageur
 * anonymisé, distance — quand l'écran de déclaration attend une offre.
 * On extrait ce qui l'intéresse plutôt que d'exposer deux formes de la
 * même chose dans toute l'application.
 *
 * Les champs qu'un expéditeur n'a pas à connaître — l'état de
 * publication, les notes du voyageur — prennent des valeurs neutres :
 * l'écran ne les lit pas, et les inventer serait pire que les omettre.
 */
export function toCapacityFromMatch(raw: RawCapacityMatch): Capacity {
  const match = toCapacityMatch(raw);
  return {
    id: match.capacityId,
    tripId: match.tripId,
    status: "published",
    totalWeightKg: match.availableWeightKg,
    availableWeightKg: match.availableWeightKg,
    currency: match.currency,
    acceptsPickup: match.acceptsPickup,
    offers: match.offers.map((offer) => ({
      categoryCode: offer.categoryCode,
      // Le prix affichable suffit à l'écran ; l'entier reste la vérité
      // côté serveur, qui recalcule le total à l'enregistrement.
      priceMinor: Math.round(Number.parseFloat(offer.priceMajor) * 100),
      priceMajor: offer.priceMajor,
      currency: match.currency,
      perPiece: offer.perPiece,
    })),
    notes: null,
    isEditable: false,
  };
}
