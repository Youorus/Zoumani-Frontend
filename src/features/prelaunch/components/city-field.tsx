"use client";

import { useId, useMemo, useRef, useState } from "react";

import { searchCities, type Suggestion } from "../model/city-search";
import styles from "./prelaunch-funnel.module.css";

/**
 * Un champ de ville, avec complétion.
 *
 * ═══ Le champ reste libre ═══
 *
 * Les suggestions aident, elles ne contraignent pas. Quelqu'un qui part
 * d'une ville absente de la liste doit pouvoir la saisir : fermer le
 * choix ferait renoncer exactement les personnes dont le trajet nous
 * apprendrait le plus — celles qu'on n'avait pas prévues.
 *
 * ═══ Le pays vient avec la ville, quand on la choisit ═══
 *
 * C'est ce qui sépare Douala du Cameroun d'un homonyme, et ce qui
 * permettra plus tard de rapprocher une ville d'un aéroport. Saisi à la
 * main, il reste vide — et c'est très bien : mieux vaut une ville sans
 * pays qu'un pays deviné.
 *
 * ═══ Le motif ARIA ═══
 *
 * `combobox` avec `listbox`, comme le prescrit la spécification : le
 * champ annonce qu'il est complété, les flèches parcourent la liste,
 * `Entrée` retient, `Échap` referme. Un `div` avec des `onClick`
 * n'aurait rien de tout cela.
 */
export function CityField({
  label,
  value,
  onChange,
  error,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (city: string, countryCode?: string) => void;
  error?: string | null;
  placeholder?: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  /** Ferme la liste juste après un choix, sans la rouvrir sur la frappe
   *  simulée que provoque le remplissage du champ. */
  const justPicked = useRef(false);

  const suggestions = useMemo<Suggestion[]>(
    () => (open ? searchCities(value) : []),
    [open, value],
  );

  function pick(suggestion: Suggestion) {
    justPicked.current = true;
    onChange(suggestion.city, suggestion.countryCode);
    setOpen(false);
    setActive(-1);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!suggestions.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => (i + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (event.key === "Enter" && active >= 0) {
      // Seulement quand une suggestion est visée : sinon `Entrée` doit
      // valider l'étape, comme dans n'importe quel formulaire.
      event.preventDefault();
      pick(suggestions[active]);
    } else if (event.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  }

  const listId = `${id}-liste`;

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.combo}>
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={suggestions.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${id}-o${active}` : undefined}
          // `off` et non `address-level2` : le navigateur proposerait ses
          // propres adresses par-dessus notre liste, et les deux se
          // recouvriraient.
          autoComplete="off"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            if (justPicked.current) justPicked.current = false;
            else setOpen(true);
            setActive(-1);
            onChange(e.target.value);
          }}
          onFocus={() => setOpen(true)}
          // Retardé : un clic sur une suggestion déclenche `blur` avant
          // le clic lui-même, et fermer tout de suite l'annulerait.
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKeyDown}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-e` : undefined}
          className={`${styles.input} ${error ? styles.inputError : ""}`}
        />

        {suggestions.length > 0 && (
          <ul id={listId} role="listbox" className={styles.suggestions}>
            {suggestions.map((suggestion, index) => (
              <li key={`${suggestion.city}-${suggestion.countryCode}`} role="none">
                <button
                  id={`${id}-o${index}`}
                  type="button"
                  role="option"
                  aria-selected={index === active}
                  // `mousedown` et non `click` : il précède `blur`, donc
                  // le choix aboutit même si le champ perd le focus.
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pick(suggestion);
                  }}
                  className={`${styles.suggestion} ${
                    index === active ? styles.suggestionActive : ""
                  }`}
                >
                  <span className={styles.suggestionCity}>{suggestion.city}</span>
                  <span className={styles.suggestionCountry}>
                    {suggestion.label.slice(suggestion.city.length)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && (
        <p id={`${id}-e`} role="alert" className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
