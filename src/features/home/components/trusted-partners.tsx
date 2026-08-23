import Image from "next/image";

import { Container } from "@/components/layout/container";

import { trustedPartners } from "../data/trusted-partners";
import type { HomeContent } from "./home-content";
import styles from "./trusted-partners.module.css";

/**
 * Le bandeau des partenaires.
 *
 * ═══ Ce qu'il remplace ═══
 *
 * Deux bandeaux défilants — un pour le transport, un pour l'assurance —
 * qui avançaient en boucle dans des directions opposées. Un logo qui bouge
 * ne se lit pas : on attend qu'il repasse. Ici ils sont tous posés d'un
 * coup, et l'œil en fait le tour en une seconde.
 *
 * ═══ Pourquoi ils sont en gris ═══
 *
 * Treize logos à leurs couleurs de marque, c'est treize chartes qui se
 * disputent la page. Désaturés et posés à mi-opacité, ils disent
 * « écosystème » sans voler la vedette à l'orange de Zoumani. Le nom reste
 * dans le `alt` : rien n'est perdu pour un lecteur d'écran.
 */
export function TrustedPartners({ copy }: { copy: HomeContent["partners"] }) {
  return (
    <section
      id="partenaires"
      className={styles.section}
      data-story-section
      aria-labelledby="trusted-partners-title"
    >
      <Container className={styles.container}>
        <p className={styles.eyebrow}>{copy.eyebrow}</p>
        <h2 id="trusted-partners-title" className={styles.title}>
          {copy.title}
        </h2>
        <p className={styles.description}>{copy.description}</p>

        <ul className={styles.list} aria-label={copy.listLabel}>
          {trustedPartners.map((partner) => (
            <li key={partner.name} className={styles.partner}>
              <Image
                src={partner.logo}
                alt={partner.name}
                width={partner.logoWidth}
                height={partner.logoHeight}
                className={styles.logo}
              />
            </li>
          ))}
        </ul>

        <p className={styles.disclaimer}>{copy.disclaimer}</p>
      </Container>
    </section>
  );
}
