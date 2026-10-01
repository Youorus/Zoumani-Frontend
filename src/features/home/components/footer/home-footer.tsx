import Link from "next/link";

import { Container } from "@/components/layout/container";
import { SymboleZoumani } from "@/components/shared/symbole-zoumani";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { ZoumaniLogo } from "@/components/shared/zoumani-logo";
import { buildWhatsAppUrl } from "@/lib/contact/build-whatsapp-url";

import type { HomeContent } from "../home-content";
import { StoreBadges } from "../hero/store-badges";
import styles from "./home-footer.module.css";

/**
 * Le pied de page.
 *
 * ═══ Il ferme ce que le hero a ouvert ═══
 *
 * Même ébène, même lueur orange en coin : la page commence et finit
 * dans la même matière, et tout ce qui est entre les deux est la lumière
 * du jour. C'est ce qui donne l'impression d'un objet fini plutôt que
 * d'une suite de sections.
 *
 * ═══ Le mot-logo géant ═══
 *
 * Il court sur toute la largeur, posé sur sa ligne de base au ras du bord
 * bas, et c'est désormais lui qui porte la couleur : un dégradé orange
 * vers soleil, le seul endroit du site où le nom est écrit en grand et en
 * couleur. C'est la dernière chose que voit un visiteur qui a tout lu,
 * et la seule où le nom occupe la place qu'une marque prend dans une
 * mémoire.
 *
 * Sa hauteur est en `em`, calée sur les métriques de la fonte : le cadre
 * s'arrête exactement sous la ligne de base, sans couper les lettres.
 */
export function HomeFooter({
  copy,
  stores,
  whatsapp,
}: {
  copy: HomeContent["footer"];
  stores: HomeContent["stores"];
  whatsapp: HomeContent["whatsapp"];
}) {
  return (
    <footer id="contact" className={styles.footer} aria-labelledby="footer-title">
      <Container className={styles.container}>
        <div className={styles.top}>
          <div className={styles.statement}>
            <div className={styles.brand}>
              <SymboleZoumani largeur={52} />
              <ZoumaniLogo className="text-[1.625rem]" inverse />
            </div>
            <h2 id="footer-title" className={styles.title}>
              {copy.title}
            </h2>
            <p className={styles.description}>{copy.description}</p>
          </div>

          <div className={styles.actions}>
            <StoreBadges copy={stores} tone="light" className={styles.stores} cta="footer" />
            <a
              className={`focus-ring ${styles.contact}`}
              href={buildWhatsAppUrl(whatsapp.message)}
              target="_blank"
              rel="noreferrer"
              aria-label={whatsapp.ariaLabel}
            >
              <WhatsAppIcon />
              {copy.linkGroups.flatMap((g) => g.links).find((l) => l.whatsapp)?.label}
            </a>
          </div>
        </div>

        <div className={styles.groups}>
          {copy.linkGroups.map((group) => (
            <nav key={group.title} className={styles.group} aria-label={group.title}>
              <h3>{group.title}</h3>
              <ul>
                {group.links.map((link) => (
                  <li key={link.label}>
                    {link.whatsapp ? (
                      <a
                        className="focus-ring"
                        href={buildWhatsAppUrl(whatsapp.message)}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={whatsapp.ariaLabel}
                      >
                        {link.label}
                      </a>
                    ) : link.href ? (
                      <Link className="focus-ring" href={link.href}>
                        {link.label}
                      </Link>
                    ) : (
                      <span>{link.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className={styles.legal}>
          <p>
            © {new Date().getFullYear()} Zoumani. {copy.legal}
          </p>
          <ul>
            {copy.legalLinks.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        </div>
        <p className={styles.storeLegal}>{copy.storeLegal}</p>
      </Container>

      {/* Hors du conteneur : il doit toucher les deux bords de la fenêtre. */}
      <p className={styles.wordmark} aria-hidden="true">
        <span>Zoumani</span>
      </p>
    </footer>
  );
}
