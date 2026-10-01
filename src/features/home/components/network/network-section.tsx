import { Container } from "@/components/layout/container";

import type { HomeContent } from "../home-content";
import styles from "./network-section.module.css";

/**
 * Le réseau : avec qui le colis avance, au-delà du voyageur.
 *
 * ═══ Pourquoi pas le mur de logos ═══
 *
 * `TrustedPartners` montre treize marques sous un titre qui laisse croire
 * à des partenariats. Aucun n'est conclu, et la section reste masquée.
 * Celle-ci ne nomme que ce qui fonctionne réellement : les entreprises de
 * fret vérifiées (ADR-0031 du backend), la confirmation des vols, le dépôt
 * en point relais Mondial Relay. Mondial Relay est cité **par son nom,
 * sans logo** : un logo se lit comme un partenariat, un nom comme un
 * service qu'on utilise — et c'est ce qu'il est.
 *
 * ═══ L'assurance est au futur, et marquée comme telle ═══
 *
 * Elle est éteinte côté serveur, faute d'assureur. L'étiquette « À venir »
 * et le registre du texte disent la même chose : ce n'est pas ouvert.
 *
 * ═══ Quatre lignes, pas quatre cartes ═══
 *
 * Une liste éditoriale, à filets : chaque entrée a son statut, son titre
 * et son explication. Ni icône ni ombre — ce qui rassure ici, c'est ce
 * qui est écrit.
 */
export function NetworkSection({ copy }: { copy: HomeContent["network"] }) {
  return (
    <section
      id="partenaires"
      className={styles.section}
      data-story-section
      aria-labelledby="network-title"
    >
      <Container className={styles.container}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <h2 id="network-title" className={styles.title}>
            {copy.title}
          </h2>
          <p className={styles.description}>{copy.description}</p>
        </div>

        <ul className={styles.list}>
          {copy.cards.map((carte) => (
            <li key={carte.id} className={styles.item} data-soon={carte.soon ? "true" : undefined}>
              <div className={styles.meta}>
                <p className={styles.tag}>{carte.tag}</p>
                <span className={styles.status}>{carte.soon ? copy.soonLabel : copy.liveLabel}</span>
              </div>
              <h3 className={styles.itemTitle}>{carte.title}</h3>
              <p className={styles.itemDetail}>{carte.detail}</p>
            </li>
          ))}
        </ul>

        <p className={styles.trademark}>{copy.trademark}</p>
      </Container>
    </section>
  );
}
