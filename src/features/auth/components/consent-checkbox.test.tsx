import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import type { RegistrationInput } from "../schemas/auth.schema";
import { ConsentCheckbox } from "./consent-checkbox";

/**
 * Le test qui manquait.
 *
 * La case était branchée avec `register()`, comme un `<input>` ordinaire.
 * Or `Checkbox` est un composant Radix : il rend un `<button
 * role="checkbox">`, et un bouton n'émet jamais d'événement `change`. Le
 * `onChange` posé par `register` n'était donc **jamais appelé**.
 *
 * Le symptôme était le pire possible : la case se cochait à l'écran, mais
 * le formulaire retenait « indéfini », la validation échouait, et le
 * bouton d'envoi ne produisait rien. Aucune erreur en console, aucune
 * requête réseau — rien à quoi se raccrocher.
 *
 * D'où ce test : il coche comme un humain, puis vérifie ce que le
 * **formulaire** a retenu, et non ce que l'écran affiche.
 */

function Harnais({ onSubmit }: { onSubmit: (values: RegistrationInput) => void }) {
  const form = useForm<RegistrationInput>({
    defaultValues: {
      firstName: "Awa",
      lastName: "Diallo",
      phoneCountryCode: "FR",
      phoneNationalNumber: "612345678",
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <ConsentCheckbox
        control={form.control}
        name="acceptsTerms"
        label="J'accepte les conditions d'utilisation"
      />
      <button type="submit">Envoyer</button>
    </form>
  );
}

describe("case de consentement", () => {
  it("transmet le consentement au formulaire quand on coche la case", async () => {
    const onSubmit = vi.fn();
    const utilisateur = userEvent.setup();
    render(<Harnais onSubmit={onSubmit} />);

    await utilisateur.click(screen.getByRole("checkbox"));
    await utilisateur.click(screen.getByRole("button", { name: "Envoyer" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ acceptsTerms: true });
  });

  it("transmet le consentement quand on clique le texte", async () => {
    // La case seule fait vingt pixels : sur un écran tactile, c'est le
    // texte que l'on vise.
    const onSubmit = vi.fn();
    const utilisateur = userEvent.setup();
    render(<Harnais onSubmit={onSubmit} />);

    await utilisateur.click(screen.getByText("J'accepte les conditions d'utilisation"));
    await utilisateur.click(screen.getByRole("button", { name: "Envoyer" }));

    expect(onSubmit.mock.calls[0][0]).toMatchObject({ acceptsTerms: true });
  });

  it("se décoche, et le formulaire le sait", async () => {
    const onSubmit = vi.fn();
    const utilisateur = userEvent.setup();
    render(<Harnais onSubmit={onSubmit} />);

    await utilisateur.click(screen.getByRole("checkbox"));
    await utilisateur.click(screen.getByRole("checkbox"));
    await utilisateur.click(screen.getByRole("button", { name: "Envoyer" }));

    expect(onSubmit.mock.calls[0][0]).toMatchObject({ acceptsTerms: false });
  });

  it("se coche au clavier, à la barre d'espace", async () => {
    // Le texte cliquable n'est qu'un confort de souris : c'est la case
    // qui porte l'accessibilité, et elle doit rester utilisable sans
    // pointeur.
    const onSubmit = vi.fn();
    const utilisateur = userEvent.setup();
    render(<Harnais onSubmit={onSubmit} />);

    await utilisateur.tab();
    await utilisateur.keyboard(" ");
    await utilisateur.click(screen.getByRole("button", { name: "Envoyer" }));

    expect(onSubmit.mock.calls[0][0]).toMatchObject({ acceptsTerms: true });
  });

  it("nomme la case par son texte, pour les lecteurs d'écran", () => {
    render(<Harnais onSubmit={vi.fn()} />);

    expect(
      screen.getByRole("checkbox", { name: "J'accepte les conditions d'utilisation" }),
    ).toBeInTheDocument();
  });
});
