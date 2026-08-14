import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { ServicePoint } from "../types/trip.types";
import { ServicePointSelector } from "./service-point-selector";

vi.mock("./service-points-map", () => ({
  ServicePointsMap: ({ isVisible }: { isVisible: boolean }) => (
    <div data-testid="service-points-map" data-visible={String(isVisible)}>
      Carte interactive
    </div>
  ),
}));

const center = { latitude: 48.8566, longitude: 2.3522 };

const nearPoint: ServicePoint = {
  code: "NEAR-1",
  name: "Pickup République",
  carrier: "colissimo",
  carrierName: "Colissimo",
  street: "10 place de la République",
  postalCode: "75011",
  city: "Paris",
  latitude: 48.867,
  longitude: 2.364,
  distanceMeters: 320,
  openingTimes: ["08:00 - 20:00"],
};

const farPoint: ServicePoint = {
  code: "FAR-1",
  name: "Relais Belleville",
  carrier: "chronopost",
  carrierName: "Chronopost",
  street: "25 rue de Belleville",
  postalCode: "75020",
  city: "Paris",
  latitude: 48.871,
  longitude: 2.381,
  distanceMeters: 1_450,
  openingTimes: ["09:00 - 19:00"],
};

describe("sélecteur de point relais", () => {
  it("classe les relais par distance et transmet un choix explicite", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <ServicePointSelector
        points={[farPoint, nearPoint]}
        center={center}
        selected={null}
        onSelect={onSelect}
      />,
    );

    const list = screen.getByRole("list", { name: "Points relais disponibles" });
    const choices = within(list).getAllByRole("button");
    expect(choices[0]).toHaveAccessibleName("Choisir Pickup République");
    expect(screen.getByText("Le plus proche")).toBeInTheDocument();

    await user.click(choices[0]);
    expect(onSelect).toHaveBeenCalledWith(nearPoint);
  });

  it("filtre les résultats sans masquer les données du backend", async () => {
    const user = userEvent.setup();

    render(
      <ServicePointSelector
        points={[nearPoint, farPoint]}
        center={center}
        selected={null}
        onSelect={vi.fn()}
      />,
    );

    await user.type(screen.getByRole("searchbox"), "Belleville");

    expect(
      screen.queryByRole("button", { name: "Choisir Pickup République" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Choisir Relais Belleville" }),
    ).toBeInTheDocument();
  });

  it("affiche les détails et un itinéraire exact pour le relais retenu", () => {
    render(
      <ServicePointSelector
        points={[nearPoint]}
        center={center}
        selected={nearPoint}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByText("Votre point de dépôt")).toBeInTheDocument();
    expect(screen.getAllByText("08:00 - 20:00")).toHaveLength(2);
    expect(screen.getByRole("link", { name: /Voir l'itinéraire/ })).toHaveAttribute(
      "href",
      "https://www.google.com/maps/dir/?api=1&destination=48.867%2C2.364",
    );
  });

  it("bascule entre la liste et la carte sur un petit écran", async () => {
    const user = userEvent.setup();

    render(
      <ServicePointSelector
        points={[nearPoint]}
        center={center}
        selected={null}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByTestId("service-points-map")).toHaveAttribute(
      "data-visible",
      "false",
    );
    await user.click(screen.getByRole("button", { name: "Carte" }));
    expect(screen.getByTestId("service-points-map")).toHaveAttribute(
      "data-visible",
      "true",
    );
  });

  it("annule un choix devenu invisible après un filtre", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <ServicePointSelector
        points={[nearPoint, farPoint]}
        center={center}
        selected={farPoint}
        onSelect={onSelect}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Colissimo" }));
    expect(onSelect).toHaveBeenLastCalledWith(null);
  });
});
