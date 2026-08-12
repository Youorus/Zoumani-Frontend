/**
 * Les formes que l'API des voyages rend, et celles qu'on manipule.
 *
 * L'API parle en `snake_case` et en unités entières ; l'interface parle
 * en `camelCase` et en kilos. La traduction se fait **ici, une fois**.
 * Sans cette frontière, chaque composant réinventerait la conversion et
 * deux d'entre eux finiraient par diverger — l'un affichant 23 kg quand
 * l'autre en montre 23 000.
 */

/** Un aéroport, tel que le référentiel du backend le rend. */
export interface Airport {
  iata: string;
  icao: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  /** Libellé prêt à afficher : `Douala (DLA)`. */
  label: string;
}

/**
 * Ce que la consultation du vol a établi.
 *
 * `unavailable` n'est **pas** un refus. C'est « je n'ai pas pu
 * vérifier » : la source était en panne, ou aucune clé n'est
 * configurée. L'interface doit le dire ainsi, sinon un voyageur
 * parfaitement honnête croit son vol inexistant.
 */
export type FlightOutcome = "confirmed" | "not_found" | "unavailable";

export interface FlightSchedule {
  /** Départ programmé, en UTC. */
  departureAt: string;
  arrivalAt: string;
  /** Identifiant commercial retenu — `AF946`. */
  flightDesignator: string;
}

export interface FlightLookup {
  outcome: FlightOutcome;
  schedule: FlightSchedule | null;
}

/** Une catégorie de colis proposée au choix du voyageur. */
export interface ParcelCategory {
  code: string;
  label: string;
  /** `kilogram` ou `piece` : décidé par le catalogue, jamais par le client. */
  unit: "kilogram" | "piece";
  restrictions: string[];
  /**
   * La catégorie engage le voyageur au-delà de l'ordinaire.
   * **Ne jamais la cocher par défaut.**
   */
  requiresTravelerConsent: boolean;
}

export interface Catalog {
  categories: ParcelCategory[];
  /** Ce qui ne voyage jamais. Affiché, jamais sélectionnable. */
  prohibited: string[];
}

export type CapacityStatus = "draft" | "published" | "withdrawn";

export interface CategoryOffer {
  categoryCode: string;
  /** Prix en unités mineures — 850 pour 8,50 €. La vérité est ici. */
  priceMinor: number;
  /** Le même prix prêt à afficher. Calculé par le serveur, jamais ici. */
  priceMajor: string;
  currency: string;
  perPiece: boolean;
}

export interface Capacity {
  id: string;
  tripId: string;
  status: CapacityStatus;
  totalWeightKg: number;
  availableWeightKg: number;
  currency: string;
  offers: CategoryOffer[];
  notes: string | null;
  /** Faux dès qu'un kilo est engagé : un expéditeur a réservé sur ce prix. */
  isEditable: boolean;
}

// ─── Formes brutes de l'API ────────────────────────────────────────────

export interface RawAirport {
  iata: string;
  icao: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  label: string;
}

export interface RawFlightLookup {
  outcome: FlightOutcome;
  schedule: {
    departure_at: string;
    arrival_at: string;
    flight_designator: string;
  } | null;
}

export interface RawCatalog {
  categories: {
    code: string;
    label: string;
    unit: "kilogram" | "piece";
    restrictions: string[];
    requires_traveler_consent: boolean;
  }[];
  prohibited: string[];
}

export interface RawCategoryOffer {
  category_code: string;
  price_minor: number;
  price_major: string;
  currency: string;
  per_piece: boolean;
}

export interface RawCapacity {
  id: string;
  trip_id: string;
  status: CapacityStatus;
  total_weight_kg: number;
  available_weight_kg: number;
  currency: string;
  offers: RawCategoryOffer[];
  notes: string | null;
  is_editable: boolean;
}

// ─── Traductions ───────────────────────────────────────────────────────

export function toFlightLookup(raw: RawFlightLookup): FlightLookup {
  return {
    outcome: raw.outcome,
    schedule: raw.schedule
      ? {
          departureAt: raw.schedule.departure_at,
          arrivalAt: raw.schedule.arrival_at,
          flightDesignator: raw.schedule.flight_designator,
        }
      : null,
  };
}

export function toCatalog(raw: RawCatalog): Catalog {
  return {
    categories: raw.categories.map((category) => ({
      code: category.code,
      label: category.label,
      unit: category.unit,
      restrictions: category.restrictions,
      requiresTravelerConsent: category.requires_traveler_consent,
    })),
    prohibited: raw.prohibited,
  };
}

export function toOffer(raw: RawCategoryOffer): CategoryOffer {
  return {
    categoryCode: raw.category_code,
    priceMinor: raw.price_minor,
    priceMajor: raw.price_major,
    currency: raw.currency,
    perPiece: raw.per_piece,
  };
}

export function toCapacity(raw: RawCapacity): Capacity {
  return {
    id: raw.id,
    tripId: raw.trip_id,
    status: raw.status,
    totalWeightKg: raw.total_weight_kg,
    availableWeightKg: raw.available_weight_kg,
    currency: raw.currency,
    offers: raw.offers.map(toOffer),
    notes: raw.notes,
    isEditable: raw.is_editable,
  };
}

/**
 * Convertit une saisie en unités mineures.
 *
 * `8,50` et `8.50` donnent tous deux `850`. La virgule est le séparateur
 * décimal du clavier français : refuser la virgule rendrait le champ
 * pénible pour la majorité des utilisateurs.
 *
 * Rend `null` si la saisie n'est pas un montant — l'appelant décide quoi
 * en dire, plutôt que de recevoir un `NaN` qui se propage.
 */
export function toMinorUnits(saisie: string): number | null {
  const propre = saisie.trim().replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(propre)) {
    return null;
  }
  return Math.round(Number.parseFloat(propre) * 100);
}

/** L'inverse, pour pré-remplir un champ depuis la mémoire des prix. */
export function fromMinorUnits(priceMinor: number): string {
  return (priceMinor / 100).toFixed(2);
}
