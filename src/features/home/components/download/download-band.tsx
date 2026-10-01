import { Container } from "@/components/layout/container";
import { buildWhatsAppUrl } from "@/lib/contact/build-whatsapp-url";

import { Emphasis } from "../emphasis";
import type { HomeContent } from "../home-content";
import { AppStoreBadge } from "../hero/store-badges";
import styles from "./download-band.module.css";

/**
 * Le dernier appel : télécharger.
 *
 * Posé sur l'orange de la charte, en pleine largeur, juste avant le
 * pied de page. C'est le seul endroit où l'orange est un fond : partout
 * ailleurs il est un accent. Un visiteur qui a tout lu arrive ici
 * convaincu ou non ; dans les deux cas, il sait quoi faire.
 *
 * Android n'a pas encore sa fiche : on le dit, et on propose d'être
 * prévenu par WhatsApp — la pré-inscription est retirée pour l'instant.
 */
export function DownloadBand({
  copy,
  stores,
  whatsapp,
}: {
  copy: HomeContent["download"];
  stores: HomeContent["stores"];
  whatsapp: HomeContent["whatsapp"];
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
          <AppStoreBadge copy={stores} cta="band-store" className={styles.badge} />
          <p className={styles.android}>
            {copy.android}{" "}
            <a
              href={buildWhatsAppUrl(whatsapp.androidMessage)}
              target="_blank"
              rel="noreferrer"
              className={`focus-ring ${styles.androidLink}`}
              data-cta="band-android"
            >
              {copy.androidCta}
              <span aria-hidden="true">→</span>
            </a>
          </p>
        </div>
      </Container>
    </section>
  );
}
