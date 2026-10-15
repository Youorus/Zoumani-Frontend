import { Container } from "@/components/layout/container";

import { Emphasis } from "../emphasis";
import type { HomeContent } from "../home-content";
import { AppBadges } from "../hero/store-badges";
import styles from "./download-band.module.css";

/**
 * Le dernier appel : télécharger.
 *
 * Posé sur l'orange de la charte, en pleine largeur, juste avant le
 * pied de page. C'est le seul endroit où l'orange est un fond : partout
 * ailleurs il est un accent. Un visiteur qui a tout lu arrive ici
 * convaincu ou non ; dans les deux cas, il sait quoi faire.
 */
export function DownloadBand({
  copy,
  stores,
}: {
  copy: HomeContent["download"];
  stores: HomeContent["stores"];
}) {
  return (
    <section className={styles.section} data-story-section aria-labelledby="download-title">
      <Container className={styles.grid}>
        <div>
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <h2 id="download-title" className={styles.title}>
            <Emphasis text={copy.title} emphasis={copy.titleEmphasis} />
          </h2>
          <p className={styles.description}>{copy.description}</p>
        </div>
        <div className={styles.actions}>
          <AppBadges copy={stores} cta="band-store" className={styles.badge} />
        </div>
      </Container>
    </section>
  );
}
