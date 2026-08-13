import Link from "next/link";
import type { PropsWithChildren } from "react";

import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { ZoumaniLogo } from "@/components/shared/zoumani-logo";
import { buildWhatsAppUrl } from "@/lib/contact/build-whatsapp-url";

import styles from "./visitor-flow-page.module.css";

type VisitorLanguage = "fr" | "en";

const flowCopy = {
  fr: {
    homeLabel: "Zoumani, retour à l’accueil",
    helpLabel: "Besoin d’aide ?",
    whatsappMessage: "Bonjour Zoumani, j’ai besoin d’aide dans mon parcours.",
    footer: "Des trajets utiles. Des liens qui restent humains.",
    security: "Paiement sécurisé · Profils vérifiés · Protection disponible",
  },
  en: {
    homeLabel: "Zoumani, back to home",
    helpLabel: "Need help?",
    whatsappMessage: "Hello Zoumani, I need help with my journey.",
    footer: "Useful journeys. Connections that stay human.",
    security: "Secure payment · Verified profiles · Protection available",
  },
} as const;

function FlowRouteArtwork() {
  return (
    <svg className={styles.routeArtwork} viewBox="0 0 620 520" aria-hidden="true">
      <path d="M28 462C130 430 128 312 244 318S374 176 576 78" />
      <path d="M118 508C188 418 276 454 326 354S430 278 606 244" />
      <circle cx="28" cy="462" r="8" />
      <circle cx="244" cy="318" r="8" />
      <circle cx="576" cy="78" r="8" />
      <circle cx="326" cy="354" r="8" />
      <circle cx="606" cy="244" r="8" />
    </svg>
  );
}

export function VisitorFlowPage({
  children,
  contextLabel,
  language,
}: PropsWithChildren<{ contextLabel: string; language: VisitorLanguage }>) {
  const copy = flowCopy[language];

  return (
    <div className={styles.page} data-visitor-flow="" style={{ colorScheme: "light" }}>
      <FlowRouteArtwork />
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className="flex items-center gap-3">
            <Link href="/" aria-label={copy.homeLabel} className="focus-ring rounded-xl">
              <ZoumaniLogo className="text-marketing-panel-foreground" />
            </Link>
            <span className={styles.headerContext}>{contextLabel}</span>
          </div>
          <div className={styles.headerActions}>
            <span className={styles.language}>{language.toUpperCase()}</span>
            <a
              className={`${styles.helpLink} focus-ring`}
              href={buildWhatsAppUrl(copy.whatsappMessage)}
              target="_blank"
              rel="noreferrer"
              aria-label={copy.helpLabel}
            >
              <WhatsAppIcon />
              <span>{copy.helpLabel}</span>
            </a>
          </div>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <p>
          <strong>Zoumani.</strong> {copy.footer}
        </p>
        <p>{copy.security}</p>
      </footer>
    </div>
  );
}
