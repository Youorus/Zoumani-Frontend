import { ArrowRight, BaggageClaim, Box } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { ZoumaniLogo } from "@/components/shared/zoumani-logo";
import { buildSignupHref } from "@/features/account/lib/build-signup-href";
import { buildWhatsAppUrl } from "@/lib/contact/build-whatsapp-url";

import type { HomeContent, HomeLanguage } from "../home-content";
import styles from "./home-footer.module.css";

function FooterRouteArtwork() {
  return (
    <svg className={styles.routeArtwork} viewBox="0 0 620 420" aria-hidden="true">
      <path d="M28 342C142 356 164 218 272 236S412 102 592 68" />
      <path d="M96 402C194 330 250 378 324 278S454 228 606 156" />
      <circle cx="28" cy="342" r="6" />
      <circle cx="272" cy="236" r="6" />
      <circle cx="592" cy="68" r="6" />
      <circle cx="324" cy="278" r="6" />
      <circle cx="606" cy="156" r="6" />
    </svg>
  );
}

export function HomeFooter({
  copy,
  language,
  whatsapp,
  routeHomeAnchors = false,
}: {
  copy: HomeContent["footer"];
  language: HomeLanguage;
  whatsapp: HomeContent["whatsapp"];
  /** Depuis une page interne, les ancres du footer visent l'accueil. */
  routeHomeAnchors?: boolean;
}) {
  return (
    <footer id="help" className={styles.footer} aria-labelledby="footer-title">
      <FooterRouteArtwork />
      <Container className={styles.container}>
        <div className={styles.callout}>
          <div>
            <p className={styles.eyebrow}>{copy.eyebrow}</p>
            <h2 id="footer-title">{copy.title}</h2>
            <p className={styles.calloutDescription}>{copy.description}</p>
          </div>
          <div className={styles.actions}>
            <Link
              className={`${styles.action} focus-ring`}
              href={routeHomeAnchors ? "/#search" : "#search"}
            >
              <Box size={18} aria-hidden="true" />
              {copy.senderCta}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link
              className={`${styles.action} ${styles.actionSecondary} focus-ring`}
              href={buildSignupHref("traveler", language)}
            >
              <BaggageClaim size={18} aria-hidden="true" />
              {copy.travelerCta}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className={styles.mainGrid}>
          <div className={styles.brand}>
            <ZoumaniLogo inverse />
            <p className={styles.brandStatement}>{copy.signature}</p>
          </div>

          {copy.linkGroups.map((group) => (
            <nav key={group.title} className={styles.linkGroup} aria-label={group.title}>
              <h3>{group.title}</h3>
              <ul>
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={
                        link.href === "/signup"
                          ? buildSignupHref("traveler", language)
                          : routeHomeAnchors && link.href.startsWith("#")
                            ? `/${link.href}`
                            : link.href
                      }
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className={styles.contact}>
            <h3>{copy.whatsappTitle}</h3>
            <p>{copy.whatsappDescription}</p>
            <a
              className={`${styles.whatsappLink} focus-ring`}
              href={buildWhatsAppUrl(whatsapp.message)}
              target="_blank"
              rel="noreferrer"
            >
              <span>
                <WhatsAppIcon />
              </span>
              {copy.whatsappCta}
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>
            © {new Date().getFullYear()} Zoumani. {copy.legal}
          </p>
          <p className={styles.signature}>{copy.signature}</p>
        </div>
      </Container>
    </footer>
  );
}
