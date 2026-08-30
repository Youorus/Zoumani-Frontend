import Link from "next/link";

import { SymboleZoumani } from "@/components/shared/symbole-zoumani";
import { ZoumaniLogo } from "@/components/shared/zoumani-logo";

import styles from "./site-chrome.module.css";

/**
 * L'en-tête et le pied de page des pages secondaires.
 *
 * ═══ Pourquoi elles en manquaient ═══
 *
 * L'accueil porte son propre en-tête et son propre pied. Les sept autres
 * pages publiques n'avaient **ni l'un ni l'autre** : ni navigation, ni
 * liens contractuels, ni retour à l'accueil. Une personne arrivée sur
 * `/cgu` depuis un moteur n'avait aucun moyen d'aller ailleurs que par
 * le bouton « précédent ».
 *
 * Côté référencement, c'est le cas d'école de la page orpheline : elle
 * figure au plan du site, donc elle est explorée, mais aucune page ne la
 * relie aux autres et elle n'en relie aucune. Le moteur en déduit qu'elle
 * compte peu — et il a raison de le déduire, puisque rien ne dit le
 * contraire.
 *
 * ═══ Ce que ce n'est pas ═══
 *
 * Pas une copie de l'en-tête de l'accueil, qui porte un menu, un
 * sélecteur de langue et un tiroir mobile. Ici : le logo, un retour, et
 * les liens qui manquent. Une page contractuelle n'a pas besoin d'un
 * menu — elle a besoin de ne pas être un cul-de-sac.
 */

const PORTES = [
  { href: "/envoyer-un-colis", label: "Envoyer un colis" },
  { href: "/proposer-un-voyage", label: "Proposer un voyage" },
  { href: "/preinscription", label: "Se pré-inscrire" },
] as const;

const CONTRACTUEL = [
  { href: "/cgu", label: "Conditions générales" },
  { href: "/confidentialite", label: "Confidentialité" },
  { href: "/cookies", label: "Cookies" },
  { href: "/mentions-legales", label: "Mentions légales" },
] as const;

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.shell}>
        <Link href="/" className={styles.brand} aria-label="Zoumani, accueil">
          <SymboleZoumani largeur={38} />
          <ZoumaniLogo className="text-[1.3rem]" />
        </Link>
        <nav className={styles.headerNav} aria-label="Navigation principale">
          {PORTES.map((porte) => (
            <Link key={porte.href} href={porte.href} className={styles.headerLink}>
              {porte.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.shell}>
        <nav className={styles.group} aria-label="Le service">
          <p className={styles.groupTitle}>Le service</p>
          {PORTES.map((porte) => (
            <Link key={porte.href} href={porte.href} className={styles.footerLink}>
              {porte.label}
            </Link>
          ))}
        </nav>

        <nav className={styles.group} aria-label="Informations légales">
          <p className={styles.groupTitle}>Informations légales</p>
          {CONTRACTUEL.map((page) => (
            <Link key={page.href} href={page.href} className={styles.footerLink}>
              {page.label}
            </Link>
          ))}
        </nav>

        <p className={styles.legal}>
          Zoumani met en relation des expéditeurs et des voyageurs. Le service n’est pas
          encore ouvert : aucune transaction n’est possible à ce jour.
        </p>
      </div>
    </footer>
  );
}
