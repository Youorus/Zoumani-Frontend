import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { HandoverStep } from "./handover-step";

const fetchHandoverOptions = vi.fn();
const estimateServiceFee = vi.fn();

vi.mock("../api/travel-client", () => ({
  fetchHandoverOptions: (...args: unknown[]) => fetchHandoverOptions(...args),
}));

vi.mock("@/features/payments/api/payment-client", () => ({
  estimateServiceFee: (...args: unknown[]) => estimateServiceFee(...args),
}));

vi.mock("./service-points-map", () => ({
  ServicePointsMap: () => <div>Carte interactive des relais</div>,
}));

const options = {
  advice: "carrier_required" as const,
  distanceMeters: 42_000,
  quotes: [
    {
      carrier: "colissimo",
      label: "Colissimo",
      shippingMinor: 780,
      priceMinor: 780,
      priceMajor: "7.80",
      source: "estimated" as const,
      isEstimate: true,
      quoteToken: "signed-quote-token",
    },
  ],
  pointsOutcome: "found" as const,
  servicePoints: [
    {
      code: "RELAY-1",
      name: "Consigne Pickup République",
      carrier: "colissimo",
      carrierName: "Colissimo",
      street: "10 place de la République",
      postalCode: "75011",
      city: "Paris",
      latitude: 48.867,
      longitude: 2.364,
      distanceMeters: 320,
      openingTimes: ["08:00 - 20:00"],
    },
  ],
};

describe("choix de la remise", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchHandoverOptions.mockResolvedValue(options);
    estimateServiceFee.mockResolvedValue({
      travelerMinor: 2_000,
      serviceFeeMinor: 249,
      currency: "EUR",
    });
  });

  it("affiche les relais réels rendus par le backend puis transmet le choix", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <HandoverStep
        sender={{ latitude: 48.85, longitude: 2.35, countryCode: "FR" }}
        senderCountryCode="FR"
        weightGrams={2_000}
        distanceMeters={42_000}
        parcelTotalMinor={2_000}
        currency="EUR"
        acceptsInPerson={false}
        onChange={onChange}
      />,
    );

    await screen.findByRole("button", {
      name: "Choisir Consigne Pickup République",
    });
    await user.click(
      screen.getByRole("button", { name: "Choisir Consigne Pickup République" }),
    );

    expect(fetchHandoverOptions).toHaveBeenCalledWith(
      expect.objectContaining({ latitude: 48.85, countryCode: "FR" }),
    );
    expect(estimateServiceFee).toHaveBeenCalledWith(2_000, "EUR");
    expect(onChange).toHaveBeenLastCalledWith({
      method: "carrier",
      pointCode: "RELAY-1",
      carrierCode: "colissimo",
      quoteToken: "signed-quote-token",
      extraMinor: 780,
    });
    expect(await screen.findByText("2.49 €")).toBeInTheDocument();
    expect(screen.getByText("30.29 €")).toBeInTheDocument();
  });

  it("propose la position du téléphone quand l'adresse historique est sans coordonnées", () => {
    render(
      <HandoverStep
        sender={null}
        senderCountryCode="FR"
        weightGrams={2_000}
        distanceMeters={null}
        parcelTotalMinor={2_000}
        currency="EUR"
        acceptsInPerson={false}
        onChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Afficher les relais près de moi" }),
    ).toBeEnabled();
  });
});
