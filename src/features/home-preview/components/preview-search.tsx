"use client";

import { ArrowRight, ArrowRightLeft, MapPin, Search } from "lucide-react";
import { useRef, useState } from "react";
import type { FormEvent } from "react";

import { APP_STORE_URL } from "@/features/home/components/hero/store-badges";
import { EVENTS, track } from "@/lib/marketing/events";

import { PREVIEW_CITIES, PREVIEW_CORRIDORS } from "../model/preview-config";
import styles from "./landing-preview.module.css";

/** Aucun appel réseau, résultat fictif ou enregistrement : la recherche existe dans l’application. */
export function PreviewSearch() {
  const [origin, setOrigin] = useState("Paris");
  const [destination, setDestination] = useState("Douala");
  const [submitted, setSubmitted] = useState<{ origin: string; destination: string } | null>(null);
  const [error, setError] = useState("");
  const started = useRef(false);

  function start() {
    if (started.current) return;
    started.current = true;
    track(EVENTS.routeStarted, { landing_variant: "v2", preview: true, intent_role: "sender", origin, destination });
  }

  function resetResult() {
    setSubmitted(null);
    setError("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    start();
    if (origin === destination) {
      setSubmitted(null);
      setError("Choisissez une destination différente de votre ville de départ.");
      return;
    }
    setError("");
    setSubmitted({ origin, destination });
    track(EVENTS.routeCompleted, { landing_variant: "v2", preview: true, intent_role: "sender", origin, destination });
  }

  const options = PREVIEW_CITIES.map((region) => (
    <optgroup label={region.region} key={region.region}>
      {region.cities.map((city) => <option key={city} value={city}>{city}</option>)}
    </optgroup>
  ));

  return (
    <div className={styles.searchPanel}>
      <form className={styles.searchForm} onSubmit={submit} onFocus={start} aria-describedby="search-note">
        <div className={styles.searchField}>
          <MapPin size={20} aria-hidden="true" />
          <div>
            <label htmlFor="preview-origin">Départ</label>
            <select id="preview-origin" value={origin} onChange={(event) => { setOrigin(event.target.value); resetResult(); }}>
              {options}
            </select>
          </div>
        </div>
        <button type="button" className={styles.swap} aria-label="Inverser le départ et la destination" onClick={() => { start(); setOrigin(destination); setDestination(origin); resetResult(); }}>
          <ArrowRightLeft size={18} aria-hidden="true" />
        </button>
        <div className={styles.searchField}>
          <MapPin size={20} aria-hidden="true" />
          <div>
            <label htmlFor="preview-destination">Destination</label>
            <select id="preview-destination" value={destination} aria-invalid={Boolean(error)} aria-describedby={error ? "search-error" : undefined} onChange={(event) => { setDestination(event.target.value); resetResult(); }}>
              {options}
            </select>
          </div>
        </div>
        <button type="submit" className={styles.primaryButton}>
          <Search size={18} aria-hidden="true" /> Rechercher un trajet
        </button>
      </form>
      <div className={styles.searchBottom}>
        <p id="search-note">Les trajets disponibles se consultent dans l’application.</p>
        <div className={styles.corridors} aria-label="Exemples de destinations">
          {PREVIEW_CORRIDORS.map((city) => (
            <button key={city} type="button" onClick={() => { start(); setOrigin("Paris"); setDestination(city); resetResult(); }}>
              Paris <span aria-hidden="true">→</span> {city}
            </button>
          ))}
        </div>
      </div>
      {error ? <p id="search-error" className={styles.searchError} role="alert">{error}</p> : null}
      <div role="status" aria-live="polite" aria-atomic="true">
        {submitted ? (
          <div className={styles.searchResult}>
            <div>
              <strong>{submitted.origin} → {submitted.destination}</strong>
              <p>Ouvrez Zoumani et saisissez ce trajet pour voir les départs publiés.</p>
            </div>
            <a href={APP_STORE_URL} target="_blank" rel="noreferrer" className={styles.textLink} data-cta="v2-search-apple" data-intent-role="sender">
              Continuer dans l’application <ArrowRight size={18} aria-hidden="true" />
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}
