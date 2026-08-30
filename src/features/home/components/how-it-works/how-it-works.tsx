"use client";

import { useId, useRef, useState } from "react";

import { Container } from "@/components/layout/container";

import type { HomeContent } from "../home-content";
import styles from "./how-it-works.module.css";

/**
 * « Comment ça marche », en deux parcours.
 *
 * ═══ Ce qu'il remplace ═══
 *
 * Une frise de six étapes photographiées, alternant gauche et droite sur
 * quatre écrans de défilement, avec cartes de preuve flottantes et tracé
 * animé au scroll. Elle racontait bien, mais elle racontait longtemps — et
 * elle mélangeait le parcours de l'expéditeur et celui du voyageur dans une
 * seule ligne, si bien qu'aucun des deux ne s'y retrouvait entièrement.
 *
 * ═══ Pourquoi des onglets ═══
 *
 * Un visiteur est l'un ou l'autre, jamais les deux à la fois. Les onglets
 * lui font lire trois étapes au lieu de six, et ce sont les siennes.
 *
 * ═══ Ce que les onglets ne font pas ═══
 *
 * Ils ne changent pas l'URL et ne sont pas des liens. Le panneau inactif
 * reste dans le document (`hidden`), donc les deux parcours sont indexés
 * par les moteurs et trouvables par la recherche du navigateur.
 */
export function HowItWorks({ copy }: { copy: HomeContent["howItWorks"] }) {
  const [actif, setActif] = useState(0);
  const identifiant = useId();
  const onglets = useRef<Array<HTMLButtonElement | null>>([]);

  // Flèches gauche/droite entre onglets : c'est ce qu'attend un lecteur
  // d'écran d'un `tablist`, et la tabulation reste réservée à la sortie
  // du groupe.
  const auClavier = (evenement: React.KeyboardEvent) => {
    const pas =
      evenement.key === "ArrowRight" ? 1 : evenement.key === "ArrowLeft" ? -1 : 0;
    if (pas === 0) return;

    evenement.preventDefault();
    const suivant = (actif + pas + copy.tabs.length) % copy.tabs.length;
    setActif(suivant);
    onglets.current[suivant]?.focus();
  };

  return (
    <section
      id="fonctionnement"
      className={styles.section}
      data-story-section
      aria-labelledby="how-it-works-title"
    >
      <Container className={styles.container}>
        <p className={styles.eyebrow}>{copy.eyebrow}</p>
        <h2 id="how-it-works-title" className={styles.title}>
          {copy.title}
        </h2>
        <p className={styles.description}>{copy.description}</p>

        <div
          className={styles.tablist}
          role="tablist"
          aria-label={copy.eyebrow}
          onKeyDown={auClavier}
        >
          {copy.tabs.map((onglet, index) => (
            <button
              key={onglet.id}
              ref={(element) => {
                onglets.current[index] = element;
              }}
              type="button"
              role="tab"
              id={`${identifiant}-tab-${onglet.id}`}
              aria-controls={`${identifiant}-panel-${onglet.id}`}
              aria-selected={index === actif}
              tabIndex={index === actif ? 0 : -1}
              className={`focus-ring ${styles.tab}`}
              onClick={() => setActif(index)}
            >
              {onglet.label}
            </button>
          ))}
        </div>

        {copy.tabs.map((onglet, index) => (
          <div
            key={onglet.id}
            role="tabpanel"
            id={`${identifiant}-panel-${onglet.id}`}
            aria-labelledby={`${identifiant}-tab-${onglet.id}`}
            hidden={index !== actif}
            className={styles.panel}
          >
            <ol className={styles.steps}>
              {onglet.steps.map((etape) => (
                <li key={etape.number} className={styles.step}>
                  <span className={styles.dot} aria-hidden="true" />
                  <span className={styles.number}>{etape.number}</span>
                  <h3 className={styles.stepTitle}>{etape.title}</h3>
                  <p className={styles.stepDetail}>{etape.detail}</p>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </Container>
    </section>
  );
}
