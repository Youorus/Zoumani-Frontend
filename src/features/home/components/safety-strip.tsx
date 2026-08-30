import { PackageCheck, ShieldCheck, UsersRound } from "lucide-react";

import type { HomeContent } from "./home-content";
import styles from "./safety-strip.module.css";

/**
 * Les trois garanties, en bande sous le hero.
 *
 * Le pictogramme est associé par le rang, pas par une clé : le
 * dictionnaire porte le texte, le composant porte la forme. C'est aussi
 * pourquoi un test vérifie qu'il y a exactement trois entrées — une
 * quatrième sortirait de la grille sans pictogramme.
 */
const ICONES = [ShieldCheck, PackageCheck, UsersRound] as const;

export function SafetyStrip({ copy }: { copy: HomeContent["safety"] }) {
  return (
    <section id="securite" className={styles.section} aria-label={copy.label}>
      <div className={styles.shell}>
        <ul className={styles.list}>
          {copy.items.map((item, rang) => {
            const Icone = ICONES[rang] ?? ShieldCheck;
            return (
              <li key={item.title} className={styles.item}>
                <span className={styles.icon}>
                  <Icone aria-hidden="true" />
                </span>
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.detail}</small>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
