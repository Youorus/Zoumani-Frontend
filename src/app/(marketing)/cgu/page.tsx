import type { Metadata } from "next";

import { CGU_MARKDOWN, CGU_UPDATED, CGU_VERSION } from "@/features/legal/cgu-content";
import { parseMarkdown } from "@/features/legal/markdown";
import styles from "./page.module.css";

/**
 * Les conditions générales d'utilisation.
 *
 * ═══ Composant serveur, rendu à la compilation ═══
 *
 * Le texte est une constante : il n'y a rien à charger, rien à attendre,
 * et pas un octet de JavaScript n'est envoyé pour cette page. C'est aussi
 * ce qui la rend lisible par un moteur — des conditions qu'on ne trouve
 * pas ne valent pas mieux que des conditions absentes.
 */

export const metadata: Metadata = {
  title: "Conditions générales d’utilisation",
  description:
    "Les règles du service Zoumani : compte, voyage, expédition, remise, prix, litiges.",
  alternates: { canonical: "/cgu" },
};

export default function CguPage() {
  const blocks = parseMarkdown(CGU_MARKDOWN);

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Conditions générales d’utilisation</h1>
      <p className={styles.meta}>
        Version {CGU_VERSION} · mise à jour le {CGU_UPDATED}
      </p>

      <article className={styles.body}>
        {blocks.map((block, index) => {
          const key = `${block.kind}-${index}`;
          switch (block.kind) {
            case "h2":
              return (
                <h2 key={key} className={styles.h2} dangerouslySetInnerHTML={{ __html: block.html }} />
              );
            case "h3":
              return (
                <h3 key={key} className={styles.h3} dangerouslySetInnerHTML={{ __html: block.html }} />
              );
            case "quote":
              return (
                <blockquote
                  key={key}
                  className={styles.quote}
                  dangerouslySetInnerHTML={{ __html: block.html }}
                />
              );
            case "ul":
            case "ol": {
              const List = block.kind === "ol" ? "ol" : "ul";
              return (
                <List key={key} className={styles.list}>
                  {block.items.map((item, i) => (
                    <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                  ))}
                </List>
              );
            }
            case "table":
              return (
                /* Le tableau défile dans son propre cadre : sur un
                   téléphone, une colonne de trop pousserait la page
                   entière vers la droite. */
                <div key={key} className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        {block.head.map((cell, i) => (
                          <th key={i} dangerouslySetInnerHTML={{ __html: cell }} />
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {block.rows.map((row, i) => (
                        <tr key={i}>
                          {row.map((cell, j) => (
                            <td key={j} dangerouslySetInnerHTML={{ __html: cell }} />
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            case "hr":
              return <hr key={key} className={styles.rule} />;
            default:
              return (
                <p key={key} className={styles.paragraph} dangerouslySetInnerHTML={{ __html: block.html }} />
              );
          }
        })}
      </article>
    </main>
  );
}
