import { describe, expect, it } from "vitest";

import {
  formatDistance,
  stageOfTrip,
  toCapacityMatch,
  toHandoverOptions,
  toRewards,
  toTrip,
  type RawCapacityMatch,
  type RawHandoverOptions,
  type RawRewards,
  type RawTrip,
  type TripStatus,
} from "./trip.types";

/**
 * Les neuf statuts d'un voyage ramenés aux quatre situations qui
 * changent quelque chose pour le voyageur.
 *
 * C'est une règle d'interface, pas un détail d'affichage : c'est elle
 * qui décide si l'écran propose « supprimer » ou « annuler », et si le
 * voyageur croit avoir quelque chose à faire.
 */
describe("l'étape d'un voyage", () => {
  it("laisse la main au voyageur sur un brouillon", () => {
    expect(stageOfTrip("draft")).toBe("brouillon");
  });

  it.each<TripStatus>([
    "pending_automatic_verification",
    "pending_manual_review",
    "verified",
  ])("ne demande rien pendant l'attente : %s", (status) => {
    // Distinguer la vérification automatique de l'examen manuel
    // n'apprendrait au voyageur qu'un détail de notre organisation.
    expect(stageOfTrip(status)).toBe("en_attente");
  });

  it("signale le seul état où la balle est dans son camp", () => {
    expect(stageOfTrip("action_required")).toBe("a_corriger");
  });

  it.each<TripStatus>(["rejected", "cancelled", "expired", "completed"])(
    "range ce dont plus rien ne sortira : %s",
    (status) => {
      expect(stageOfTrip(status)).toBe("clos");
    },
  );
});

describe("la traduction d'un voyage", () => {
  const brut: RawTrip = {
    id: "t1",
    status: "verified",
    origin_airport_code: "CDG",
    destination_airport_code: "DLA",
    departure_at: "2026-08-20T10:25:00Z",
    arrival_at: "2026-08-20T17:45:00Z",
    segments: [
      {
        segment_order: 1,
        airline_code: "AF",
        flight_number: "946",
        origin_airport_code: "CDG",
        destination_airport_code: "DLA",
        departure_at: "2026-08-20T10:25:00Z",
        arrival_at: "2026-08-20T17:45:00Z",
      },
    ],
    rejection_reason: null,
    correction_note: null,
    is_editable: false,
    can_carry_offer: true,
    created_at: "2026-08-13T09:00:00Z",
    verified_at: "2026-08-13T10:00:00Z",
  };

  it("calcule l'étape en même temps que le reste", () => {
    expect(toTrip(brut).stage).toBe("en_attente");
  });

  it("conserve les décisions du serveur", () => {
    // `isEditable` et `canCarryOffer` sont tranchés côté API : les
    // recalculer ici produirait un second avis, qui divergerait.
    const trip = toTrip(brut);

    expect(trip.isEditable).toBe(false);
    expect(trip.canCarryOffer).toBe(true);
  });

  it("traduit l'itinéraire complet", () => {
    expect(toTrip(brut).segments[0].flightNumber).toBe("946");
  });
});

describe("le programme de fidélité", () => {
  const brut: RawRewards = {
    balance: 380,
    tier: { code: "explorer", name: "Explorateur", threshold: 0, perks: ["Priorité"] },
    next_tier: {
      code: "ambassador",
      name: "Ambassadeur",
      threshold: 500,
      perks: ["Une nuit d'hôtel"],
    },
    points_to_next: 120,
    progress: 0.76,
    history: [
      {
        reason: "trip_verified",
        amount: 50,
        occurred_at: "2026-08-13T10:00:00Z",
        note: null,
      },
    ],
    all_tiers: [],
    earning_rules: {
      trip_verified: 20,
      capacity_published: 10,
      delivery_completed: 100,
      commitment_broken: -300,
      manual_adjustment: 0,
    },
    rewards: [
      {
        code: "hotel_night",
        title: "Une nuit d'hôtel",
        description: "Une nuit pour souffler.",
        points_required: 1000,
        points_remaining: 620,
        progress: 0.38,
        value_label: "Jusqu'à 90 €",
        icon: "hotel",
        terms: "Selon disponibilité.",
        annual_limit: 1,
        unlocked: false,
      },
    ],
  };

  it("garde le reste à parcourir tel que le serveur le calcule", () => {
    // « 120 points » est un objectif ; un pourcentage n'en est pas un.
    // Le recalculer côté client donnerait deux chiffres pour un seul fait.
    expect(toRewards(brut).pointsToNext).toBe(120);
    expect(toRewards(brut).progress).toBe(0.76);
    expect(toRewards(brut).earningRules.delivery_completed).toBe(100);
    expect(toRewards(brut).rewardCatalog[0].pointsRemaining).toBe(620);
  });

  it("distingue un gain d'une perte dans l'historique", () => {
    expect(toRewards(brut).history[0].amount).toBeGreaterThan(0);
  });

  it("accepte l'ancien contrat pendant un déploiement décalé", () => {
    const { rewards: _rewards, ...ancienContrat } = brut;

    expect(toRewards(ancienContrat).rewardCatalog).toEqual([]);
  });

  it("accepte l'absence de palier suivant au sommet", () => {
    const sommet = toRewards({
      ...brut,
      next_tier: null,
      points_to_next: null,
      progress: 1,
    });

    expect(sommet.nextTier).toBeNull();
    expect(sommet.pointsToNext).toBeNull();
  });
});

describe("la recherche d'un expéditeur", () => {
  const brut: RawCapacityMatch = {
    capacity_id: "c1",
    trip_id: "t1",
    traveler: { display_name: "Aïcha D.", photo_url: null, reward_points: 575 },
    origin: "CDG",
    origin_city: "Paris",
    origin_country: "FR",
    destination: "DLA",
    destination_city: "Douala",
    destination_country: "CM",
    departure_at: "2026-09-01T10:25:00Z",
    available_weight_kg: 23,
    currency: "EUR",
    accepts_in_person: true,
    offers: [{ category_code: "clothing", price_major: "8.00", per_piece: false }],
    distance_meters: 6200,
  };

  it("ne reçoit jamais l'identité du voyageur", () => {
    // La troncature est faite par le serveur : le client n'a pas de nom
    // complet à tronquer, et n'aurait pas pu le protéger s'il en avait un.
    const match = toCapacityMatch(brut);

    expect(match.traveler.displayName).toBe("Aïcha D.");
    expect(Object.keys(match.traveler)).toEqual([
      "displayName",
      "photoUrl",
      "rewardPoints",
    ]);
    expect(match.traveler.rewardPoints).toBe(575);
  });

  it("accepte une distance absente sans se casser", () => {
    // Le cas courant : géocodage en échec, ou visiteur non connecté.
    expect(toCapacityMatch({ ...brut, distance_meters: null }).distanceMeters).toBeNull();
  });

  it("garde le prix affichable calculé par le serveur", () => {
    expect(toCapacityMatch(brut).offers[0].priceMajor).toBe("8.00");
  });
});

describe("l'affichage d'une distance", () => {
  it("arrondit à la centaine sous le kilomètre", () => {
    // « 843 m » donnerait une précision que le géocodage ne porte pas.
    expect(formatDistance(843)).toBe("800 m");
    expect(formatDistance(120)).toBe("100 m");
  });

  it("garde une décimale jusqu'à dix kilomètres", () => {
    expect(formatDistance(6200)).toBe("6.2 km");
  });

  it("passe à l'unité entière au-delà", () => {
    // Personne ne décide sur 300 mètres à cette échelle.
    expect(formatDistance(42_300)).toBe("42 km");
    expect(formatDistance(5_000_000)).toBe("5000 km");
  });
});

describe("les options de remise", () => {
  const brut: RawHandoverOptions = {
    advice: "carrier_required",
    distance_meters: 45_000,
    quotes: [
      {
        carrier: "mondial_relay",
        label: "Mondial Relay",
        shipping_minor: 450,
        price_minor: 450,
        price_major: "4.50",
        source: "estimated",
        is_estimate: true,
        quote_token: "quote-mondial",
      },
      {
        carrier: "colissimo",
        label: "Colissimo",
        shipping_minor: 590,
        price_minor: 590,
        price_major: "5.90",
        source: "sendcloud",
        is_estimate: false,
        quote_token: "quote-colissimo",
      },
    ],
    points_outcome: "found",
    service_points: [
      {
        code: "367047",
        name: "CARREFOUR BON APP",
        carrier: "colissimo",
        carrier_name: "Colissimo",
        street: "15 RUE DE LA VERRERIE",
        postal_code: "75004",
        city: "PARIS",
        latitude: 48.857292,
        longitude: 2.354634,
        distance_meters: 319,
        opening_times: ["08:00 - 20:00"],
      },
    ],
  };

  it("conserve le conseil rendu par le serveur", () => {
    // Le seuil est une décision commerciale : la dupliquer côté client
    // ferait diverger les deux au premier ajustement.
    expect(toHandoverOptions(brut).advice).toBe("carrier_required");
  });

  it("distingue « pas pu chercher » de « aucun point »", () => {
    // Le test qui protège d'un mensonge : un fournisseur en panne ne
    // doit jamais faire croire qu'aucun relais n'existe.
    expect(
      toHandoverOptions({ ...brut, points_outcome: "unavailable" }).pointsOutcome,
    ).toBe("unavailable");
    expect(
      toHandoverOptions({ ...brut, points_outcome: "none_nearby" }).pointsOutcome,
    ).toBe("none_nearby");
  });

  it("conserve la provenance et le jeton signé du devis", () => {
    const quote = toHandoverOptions(brut).quotes[0];

    expect(quote.shippingMinor).toBe(450);
    expect(quote.priceMinor).toBe(450);
    expect(quote.priceMajor).toBe("4.50");
    expect(quote.isEstimate).toBe(true);
    expect(quote.quoteToken).toBe("quote-mondial");
  });

  it("traduit un point de dépôt avec ses horaires", () => {
    const point = toHandoverOptions(brut).servicePoints[0];

    expect(point.carrierName).toBe("Colissimo");
    expect(point.distanceMeters).toBe(319);
    expect(point.openingTimes).toEqual(["08:00 - 20:00"]);
  });
});
