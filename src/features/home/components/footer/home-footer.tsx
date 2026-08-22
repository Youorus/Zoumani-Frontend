import Link from "next/link";

import { Container } from "@/components/layout/container";
import { SymboleZoumani } from "@/components/shared/symbole-zoumani";
import { ZoumaniLogo } from "@/components/shared/zoumani-logo";
import { buildWhatsAppUrl } from "@/lib/contact/build-whatsapp-url";

import type { HomeContent } from "../home-content";
import { StoreBadges } from "../hero/store-badges";
import styles from "./home-footer.module.css";

/**
 * Le pied de page.
 *
 * ═══ Le mot-logo géant ═══
 *
 * Il court sur toute la largeur, posé sur sa ligne de base au ras du bord
 * bas. Ce n'est pas un ornement : c'est la dernière chose que voit un
 * visiteur qui a fait défiler toute la page, et le seul endroit où le nom
 * occupe la place qu'une marque prend dans une mémoire.
 *
 * Sa hauteur est en `em`, calée sur les métriques de la fonte : le cadre
 * s'arrête exactement sous la ligne de base, sans couper les lettres ni
 * laisser un blanc.
 *
 * ═══ Les libellés qui ne sont pas des liens ═══
 *
 * « Contenus autorisés », « Tarifs », « Rémunération » : les pages
 * n'existent pas encore. Elles sont rendues en texte, pas en `<a href="#">`
 * — un lien qui ne mène nulle part fait croire à une panne.
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
          <div>
            <div className={styles.brand}>
              <SymboleZoumani largeur={52} />
              <ZoumaniLogo className="text-[1.625rem]" inverse />
            </div>
            <h2 id="footer-title" className={styles.title}>
              {copy.title}
            </h2>
            <p className={styles.description}>{copy.description}</p>
          </div>

          <StoreBadges
            copy={stores}
            tone="light"
            stack
            className={styles.stores}
          />
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
      </Container>

      {/* Hors du conteneur : il doit toucher les deux bords de la fenêtre. */}
      <p className={styles.wordmark} aria-hidden="true">
        <span>Zoumani</span>
      </p>
    </footer>
  );
}
