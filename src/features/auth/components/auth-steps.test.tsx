import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AuthSteps } from "./auth-steps";

/**
 * Le fil d'étapes ne doit annoncer que ce qui va se produire.
 *
 * Une étape affichée puis jamais atteinte est le pire des deux mondes : la
 * personne attend un SMS qui ne partira pas, et croit à un échec au moment
 * précis où tout a réussi. C'est aussi le genre de détail qui ne casse
 * aucun test et qu'on ne voit qu'en production.
 */
const LABELS = {
  email: "Votre e-mail",
  identity: "Vos informations",
  phone: "Votre téléphone",
};

describe("AuthSteps", () => {
  it("masque l'étape du téléphone quand l'API ne l'exige pas", () => {
    render(
      <AuthSteps
        screen="email"
        labels={LABELS}
        registering={false}
        phoneFactor={false}
      />,
    );

    expect(screen.getByText(LABELS.email)).toBeInTheDocument();
    expect(screen.queryByText(LABELS.phone)).not.toBeInTheDocument();
  });

  it("l'annonce dès que l'API l'exige", () => {
    // Le jour du rétablissement, l'étape revient sans qu'une ligne change
    // ici : c'est le serveur qui répond, l'interface n'a pas de copie.
    render(
      <AuthSteps screen="email" labels={LABELS} registering={false} phoneFactor={true} />,
    );

    expect(screen.getByText(LABELS.phone)).toBeInTheDocument();
  });

  it("marque une étape en cours, même sans celle du téléphone", () => {
    // Sans borne, l'écran d'arrivée pointait au-delà de la dernière étape
    // et aucune n'était marquée : le fil semblait figé au départ.
    render(
      <AuthSteps
        screen="registration"
        labels={LABELS}
        registering={true}
        phoneFactor={false}
      />,
    );

    expect(screen.getByText(LABELS.identity).closest("li")).toHaveAttribute(
      "aria-current",
      "step",
    );
  });
});
