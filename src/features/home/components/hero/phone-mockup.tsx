import Image from "next/image";

import styles from "./phone-mockup.module.css";

/**
 * Une seule source à remplacer quand la capture définitive sera prête.
 * Le châssis, le verre et la perspective restent indépendants de l'écran.
 */
export const APP_SCREENSHOT = "/images/hero/zoumani-app-screen.webp";

export function PhoneMockup({
  screenshot = APP_SCREENSHOT,
}: {
  screenshot?: string;
}) {
  return (
    <div className={styles.scene} aria-hidden="true">
      <div className={styles.groundShadow} />
      <div className={styles.device}>
        <span className={styles.silentButton} />
        <span className={styles.volumeButtonTop} />
        <span className={styles.volumeButtonBottom} />
        <span className={styles.powerButton} />

        <div className={styles.metalFrame}>
          <div className={styles.screen}>
            <Image
              src={screenshot}
              alt=""
              fill
              loading="eager"
              sizes="(max-width: 640px) 68vw, (max-width: 1024px) 34vw, 23vw"
              className={styles.screenshot}
            />
            <span className={styles.dynamicIsland} />
            <span className={styles.glassReflection} />
          </div>
        </div>
      </div>
    </div>
  );
}
