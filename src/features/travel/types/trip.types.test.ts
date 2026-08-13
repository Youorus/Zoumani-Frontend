import { describe, expect, it } from "vitest";

import {
  stageOfTrip,
  toRewards,
  toTrip,
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
  };

  it("garde le reste à parcourir tel que le serveur le calcule", () => {
    // « 120 points » est un objectif ; un pourcentage n'en est pas un.
    // Le recalculer côté client donnerait deux chiffres pour un seul fait.
    expect(toRewards(brut).pointsToNext).toBe(120);
    expect(toRewards(brut).progress).toBe(0.76);
  });

  it("distingue un gain d'une perte dans l'historique", () => {
    expect(toRewards(brut).history[0].amount).toBeGreaterThan(0);
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
