import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { CapacityMatch } from "../types/trip.types";
import { TravelerCard } from "./traveler-card";

const match: CapacityMatch = {
  capacityId: "capacity-1",
  tripId: "trip-1",
  traveler: { displayName: "Awa D.", photoUrl: null, rewardPoints: 575 },
  origin: "CDG",
  originCity: "Paris",
  originCountry: "FR",
  destination: "ABJ",
  destinationCity: "Abidjan",
  destinationCountry: "CI",
  departureAt: "2026-09-10T10:00:00Z",
  availableWeightKg: 8,
  currency: "EUR",
  acceptsPickup: true,
  offers: [
    { categoryCode: "clothing", priceMajor: "10.00", perPiece: false },
    { categoryCode: "electronics", priceMajor: "18.50", perPiece: true },
  ],
  distanceMeters: 12_000,
};

describe("carte d'un voyageur", () => {
  it("montre les éléments qui permettent réellement de choisir", () => {
    render(
      <TravelerCard
        match={match}
        labels={{ clothing: "Vêtements", electronics: "Électronique" }}
      />,
    );

    expect(screen.getByText("Voyage contrôlé par Zoumani")).toBeInTheDocument();
    expect(screen.getByText("8 kg")).toBeInTheDocument();
    expect(screen.getByText("Relais partenaire possible")).toBeInTheDocument();
    expect(screen.getByText("Vêtements")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Choisir ce voyageur/ })).toHaveAttribute(
      "href",
      "/envois/nouveau?capacity=capacity-1&distance=12000",
    );
  });

  it("ne transforme pas le contrôle du voyage en vérification d'identité", () => {
    render(<TravelerCard match={match} labels={{}} />);

    expect(screen.queryByText("Identité vérifiée")).not.toBeInTheDocument();
    expect(screen.getByText("575 points Zoumani")).toBeInTheDocument();
  });

  it("accueille un nouveau voyageur sans le présenter comme peu fiable", () => {
    render(
      <TravelerCard
        match={{ ...match, traveler: { ...match.traveler, rewardPoints: 0 } }}
        labels={{}}
      />,
    );

    expect(screen.getByText("Nouveau sur Zoumani")).toBeInTheDocument();
    expect(screen.queryByText(/0 points/)).not.toBeInTheDocument();
  });
});
