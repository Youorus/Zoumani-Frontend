import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Capacity } from "../types/travel.types";
import type { CapacityMatch } from "../types/trip.types";
import { DeclareShipmentView } from "./declare-shipment-view";

const push = vi.fn();
const declareShipment = vi.fn();
const updateShipment = vi.fn();
const uploadParcelPhoto = vi.fn();
const submitShipment = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh: vi.fn() }),
}));

vi.mock("../api/travel-client", () => ({
  declareShipment: (...args: unknown[]) => declareShipment(...args),
  updateShipment: (...args: unknown[]) => updateShipment(...args),
  uploadParcelPhoto: (...args: unknown[]) => uploadParcelPhoto(...args),
  submitShipment: (...args: unknown[]) => submitShipment(...args),
}));

vi.mock("./trip-summary-banner", () => ({
  TripSummaryBanner: () => <div>Paris vers Abidjan</div>,
}));

vi.mock("./category-photos-step", () => ({
  MIN_PHOTOS: 3,
  CategoryPhotosStep: ({
    onChange,
  }: {
    onChange: (value: { files: File[]; note: string }) => void;
  }) => (
    <button
      type="button"
      onClick={() =>
        onChange({
          files: [
            new File(["1"], "face.jpg"),
            new File(["2"], "dos.jpg"),
            new File(["3"], "scelle.jpg"),
          ],
          note: "Carton fermé",
        })
      }
    >
      Ajouter trois photos
    </button>
  ),
}));

vi.mock("./handover-step", () => ({
  HandoverStep: ({
    onChange,
  }: {
    onChange: (choice: {
      method: "carrier";
      pointCode: string;
      carrierCode: string;
      extraMinor: number;
    }) => void;
  }) => (
    <button
      type="button"
      onClick={() =>
        onChange({
          method: "carrier",
          pointCode: "RELAY-1",
          carrierCode: "colissimo",
          extraMinor: 500,
        })
      }
    >
      Choisir le relais Zoumani
    </button>
  ),
}));

const capacity: Capacity = {
  id: "capacity-1",
  tripId: "trip-1",
  status: "published",
  totalWeightKg: 12,
  availableWeightKg: 8,
  currency: "EUR",
  offers: [
    {
      categoryCode: "clothing",
      priceMinor: 1_000,
      priceMajor: "10.00",
      currency: "EUR",
      perPiece: false,
    },
  ],
  acceptsPickup: true,
  notes: null,
  isEditable: false,
};

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
  offers: [{ categoryCode: "clothing", priceMajor: "10.00", perPiece: false }],
  distanceMeters: 12_000,
};

describe("parcours d'envoi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    declareShipment.mockResolvedValue({ id: "shipment-1" });
    uploadParcelPhoto
      .mockResolvedValueOnce("photo-1")
      .mockResolvedValueOnce("photo-2")
      .mockResolvedValueOnce("photo-3");
    updateShipment.mockResolvedValue({ id: "shipment-1" });
    submitShipment.mockResolvedValue({ id: "shipment-1" });
  });

  it("va jusqu'à la transmission avec la remise choisie", async () => {
    const user = userEvent.setup();
    render(
      <DeclareShipmentView
        capacity={capacity}
        labels={{ clothing: "Vêtements" }}
        match={match}
        sender={{ latitude: 48.85, longitude: 2.35, countryCode: "FR" }}
        distanceMeters={12_000}
      />,
    );

    await user.click(screen.getByRole("checkbox"));
    await user.type(screen.getByLabelText("Quantité pour Vêtements"), "2");
    await user.click(screen.getByRole("button", { name: "Continuer" }));
    await screen.findByText("Montrez-nous le contenu");

    await user.click(screen.getByRole("button", { name: "Ajouter trois photos" }));
    await user.click(screen.getByRole("button", { name: "Continuer" }));
    await screen.findByText("Comment rejoint-il le voyageur ?");

    await user.click(screen.getByRole("button", { name: "Choisir le relais Zoumani" }));
    await user.click(screen.getByRole("button", { name: /Confirmer/ }));

    await waitFor(() => expect(submitShipment).toHaveBeenCalledWith("shipment-1"));
    expect(updateShipment.mock.calls[0][2]).toBe("carrier");
    expect(updateShipment.mock.calls[0][3]).toEqual({
      pointCode: "RELAY-1",
      carrierCode: "colissimo",
    });
    expect(uploadParcelPhoto).toHaveBeenCalledTimes(3);
    expect(push).toHaveBeenCalledWith("/compte/envois");
  });
});
