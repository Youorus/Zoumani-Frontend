import type { HomeContent } from "./home-content";
import styles from "./floating-whatsapp.module.css";
import { WhatsAppIcon } from "./whatsapp-icon";
import { buildWhatsAppUrl } from "../lib/build-whatsapp-url";

export function FloatingWhatsApp({ copy }: { copy: HomeContent["whatsapp"] }) {
  return (
    <a
      className={`${styles.link} focus-ring`}
      href={buildWhatsAppUrl(copy.message)}
      target="_blank"
      rel="noreferrer"
      aria-label={copy.ariaLabel}
    >
      <span className={styles.icon}>
        <WhatsAppIcon />
      </span>
      <span className={styles.label}>
        <small>{copy.eyebrow}</small>
        {copy.label}
      </span>
    </a>
  );
}
