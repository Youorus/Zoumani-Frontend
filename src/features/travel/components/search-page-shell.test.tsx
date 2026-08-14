import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SearchPageShell } from "./search-page-shell";

vi.mock("@/features/home/components/shipment-search", () => ({
  ShipmentSearch: ({
    initialFilters,
  }: {
    initialFilters: { origin: string; destination: string };
  }) => (
    <div data-testid="search-bar">
      {initialFilters.origin} vers {initialFilters.destination}
    </div>
  ),
}));

vi.mock("@/features/home/components/footer/home-footer", () => ({
  HomeFooter: () => <footer>Pied de page Zoumani</footer>,
}));

const criteria = { origin: "BRU", destination: "DLA", categories: [] };

describe("cadre des résultats", () => {
  it("garde le header, la recherche et le footer dans une session connectée", () => {
    render(
      <SearchPageShell connected criteria={criteria}>
        <p>Un résultat</p>
      </SearchPageShell>,
    );

    expect(screen.getByRole("link", { name: "Mon espace" })).toBeInTheDocument();
    expect(screen.getByTestId("search-bar")).toHaveTextContent("BRU vers DLA");
    expect(screen.getByRole("contentinfo")).toHaveTextContent("Pied de page Zoumani");
    expect(screen.getByText("Un résultat")).toBeInTheDocument();
  });

  it("propose l'authentification au visiteur sans changer la structure", () => {
    render(
      <SearchPageShell connected={false} criteria={criteria}>
        <p>Aucun résultat</p>
      </SearchPageShell>,
    );

    expect(screen.getByRole("link", { name: "Se connecter" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Créer un compte" })).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});
