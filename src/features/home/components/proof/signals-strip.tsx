import { Container } from "@/components/layout/container";

import type { HomeContent } from "../home-content";
import styles from "./signals-strip.module.css";

/**
 * Quatre indicateurs, en gros chiffres, datés.
 *
 * ═══ Comment on les affiche, et pourquoi comme ça ═══
 *
 * Un visiteur décide en une seconde si l'entreprise « joue déjà ». Les
 * startups le disent avec des chiffres ; nous aussi — à condition qu'ils
 * soient vrais. Ceux-ci le sont, et chacun a une source : la table des
 * agences démarchées, la liste des pays de destination demandés, une
 * règle du produit (tout trajet est vérifié), un prix (zéro pour les
 * particuliers). Pas de compteur d'utilisateurs : il est trop petit pour
 * être écrit, et il le sera tant qu'il ne parlera pas de lui-même.
 *
 * La date en pied dit quand ils ont été relevés. Ils se mettent à jour
 * dans `home-content.ts`, à la main, quand la réalité change — c'est le
 * prix d'un chiffre qu'on peut défendre.
 */
export function SignalsStrip({ copy }: { copy: HomeContent["signals"] }) {
  return (
    <section className={styles.section} aria-label={copy.asOf}>
      <Container>
        <ul className={styles.list}>
          {copy.items.map((item) => (
            <li key={item.label} className={styles.item}>
              <p className={styles.value}>{item.value}</p>
              <h2 className={styles.label}>{item.label}</h2>
              <p className={styles.detail}>{item.detail}</p>
            </li>
          ))}
        </ul>
        <p className={styles.asOf}>{copy.asOf}</p>
      </Container>
    </section>
  );
}
