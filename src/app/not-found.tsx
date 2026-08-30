import type { Metadata } from "next";
import Link from "next/link";

import styles from "./not-found.module.css";

/**
 * La page d'adresse introuvable.
 *
 * ═══ Ce qu'elle était ═══
 *
 * Un état vide sans titre de niveau 1, sans titre de document propre —
 * elle reprenait celui de l'accueil — et dont le texte parlait de
 * « l'architecture Zoumani » et invitait à « revenir au socle ». Écrit
 * pour un développeur, servi à un visiteur.
 *
 * ═══ Ce qu'une 404 doit faire ═══
 *
 * Le code HTTP est déjà correct : Next rend 404 pour ce fichier, vérifié
 * en production. Restait le reste — un H1, un titre de document distinct,
 * et surtout des chemins de sortie. Une 404 qui ne propose qu'un retour à
 * l'accueil renvoie le visiteur au point de départ ; celle-ci nomme les
 * deux portes du site, qui sont ce qu'il cherchait dans neuf cas sur dix.
 *
 * `noindex` est explicite : une adresse morte ne doit pas entrer dans un
 * index, et le code 404 ne suffit pas toujours à l'en empêcher lorsque
 * d'autres pages y renvoient.
 */
export const metadata: Metadata = {
  title: "Page introuvable",
  robots: { index: false, follow: true },
};

const SORTIES = [
  {
    href: "/envoyer-un-colis",
    titre: "J’ai un colis à envoyer",
    texte: "Confiez-le à quelqu’un qui fait déjà le trajet.",
  },
  {
    href: "/proposer-un-voyage",
    titre: "Je pars bientôt en voyage",
    texte: "Rentabilisez les kilos libres de votre valise.",
  },
] as const;

export default function NotFound() {
  return (
    <main className={styles.page}>
      <p className={styles.code}>Erreur 404</p>
      <h1 className={styles.title}>Cette page n’existe pas.</h1>
      <p className={styles.lede}>
        L’adresse est peut-être ancienne, ou comporte une faute de frappe. Voici où
        aller.
      </p>

      <ul className={styles.exits}>
        {SORTIES.map((sortie) => (
          <li key={sortie.href}>
            <Link href={sortie.href} className={styles.exit}>
              <strong>{sortie.titre}</strong>
              <span>{sortie.texte}</span>
            </Link>
          </li>
        ))}
      </ul>

      <p className={styles.more}>
        Ou revenez à <Link href="/">l’accueil</Link>, lisez la{" "}
        <Link href="/cgu">notice du service</Link>, ou{" "}
        <Link href="/preinscription">pré-inscrivez-vous à l’ouverture</Link>.
      </p>
    </main>
  );
}
