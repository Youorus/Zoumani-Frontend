import Image from "next/image";

import { Container } from "@/components/layout/container";

import { trustedPartners } from "../data/trusted-partners";
import type { HomeContent } from "./home-content";
import styles from "./trusted-partners.module.css";

/**
 * Les réseaux de transport et d'assurance, en logos.
 *
 * ═══ Ce que la bande dit, et ce qu'elle ne dit pas ═══
 *
 * Le titre dit « emprunte des réseaux qui existent déjà », pas
 * « partenaires » : les transporteurs sont ceux que l'étiquette créée
 * dans l'application permet d'atteindre, et les assureurs sont à l'étude.
 * Les deux groupes sont séparés et étiquetés, et l'avertissement est
 * sous la bande, lisible. C'est la condition pour montrer ces logos sans
 * laisser croire à un accord qui n'existe pas.
 *
 * ═══ Pourquoi ils sont en gris ═══
 *
 * Treize logos à leurs couleurs, c'est treize chartes qui se disputent
 * la page. Désaturés et à mi-opacité, ils disent « écosystème » sans
 * voler la vedette à l'orange de Zoumani. Le nom reste dans le `alt`.
 */
export function TrustedPartners({ copy }: { copy: HomeContent["partners"] }) {
  const transporteurs = trustedPartners.filter((p) => p.category === "logistics");
  const assureurs = trustedPartners.filter((p) => p.category === "insurance");

  return (
    <section className={styles.section} data-story-section aria-labelledby="partners-title">
      <Container className={styles.container}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <h2 id="partners-title" className={styles.title}>
            {copy.title}
          </h2>
          <p className={styles.description}>{copy.description}</p>
        </div>

        <div className={styles.groups}>
          {[
            { label: copy.carriersLabel, items: transporteurs },
            { label: copy.insurersLabel, items: assureurs },
          ].map((groupe) => (
            <div key={groupe.label} className={styles.group}>
              <p className={styles.groupLabel}>{groupe.label}</p>
              <ul className={styles.logos} aria-label={groupe.label}>
                {groupe.items.map((partner) => (
                  <li key={partner.name} className={styles.logo}>
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      width={partner.logoWidth}
                      height={partner.logoHeight}
                      className={styles.logoImage}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className={styles.disclaimer}>{copy.disclaimer}</p>
      </Container>
    </section>
  );
}
