import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DateField } from "./date-field";

/**
 * Le calendrier ne doit jamais **produire** une date hors de ses bornes.
 *
 * Ce test naît d'un défaut réel : le sélecteur s'ouvrait trente ans en
 * arrière — ce que veut une date de naissance — dans un champ qui
 * n'acceptait que le futur. Le curseur sortait des bornes, et la date
 * composée partait avec lui. Un vol s'est retrouvé daté de 1996, et la
 * vérification échouait sans que rien n'explique pourquoi.
 *
 * On éprouve donc la **valeur rendue**, et non ce que le sélecteur
 * affiche : c'est elle qui part au serveur, et c'est elle qui était
 * fausse. Un test sur l'affichage aurait passé sans rien prouver — un
 * `<select>` dont la valeur manque à ses options retombe silencieusement
 * sur la première.
 */
describe("les bornes du calendrier", () => {
  const anneeCourante = new Date().getFullYear();

  function choisirUnJour(props: { minYear?: number; maxYear?: number }): string {
    const onChange = vi.fn();
    render(
      <DateField ariaLabel="Date de départ" value="" onChange={onChange} {...props} />,
    );
    fireEvent.click(screen.getByLabelText("Date de départ"));
    // Le 15 existe dans tous les mois : aucun risque de tomber sur une
    // case absente selon la date d'exécution du test.
    fireEvent.click(screen.getByRole("button", { name: "15" }));

    expect(onChange).toHaveBeenCalledTimes(1);
    return onChange.mock.calls[0][0] as string;
  }

  it("ne rend jamais une date antérieure à la borne basse", () => {
    const iso = choisirUnJour({ minYear: anneeCourante, maxYear: anneeCourante + 2 });

    expect(Number(iso.slice(0, 4))).toBeGreaterThanOrEqual(anneeCourante);
  });

  it("ne rend jamais une date au-delà de la borne haute", () => {
    const iso = choisirUnJour({ minYear: anneeCourante, maxYear: anneeCourante + 2 });

    expect(Number(iso.slice(0, 4))).toBeLessThanOrEqual(anneeCourante + 2);
  });

  it("garde son ouverture en arrière quand la plage le permet", () => {
    // Le comportement d'origine reste : une date de naissance s'ouvre
    // trente ans en arrière plutôt qu'aujourd'hui.
    const iso = choisirUnJour({});

    expect(Number(iso.slice(0, 4))).toBe(anneeCourante - 30);
  });
});
