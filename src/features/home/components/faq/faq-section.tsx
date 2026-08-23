import { ChevronDown } from "lucide-react";

import { Container } from "@/components/layout/container";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { buildWhatsAppUrl } from "@/lib/contact/build-whatsapp-url";

import type { HomeContent } from "../home-content";
import styles from "./faq-section.module.css";

/**
 * Les questions fréquentes.
 *
 * ═══ Pourquoi `<details>` et non un accordéon en React ═══
 *
 * On y gagne le clavier, les rôles ARIA, la recherche du navigateur
 * (Ctrl+F trouve une réponse repliée) et le fonctionnement avant
 * hydratation — quatre choses qu'un accordéon maison doit réimplémenter,
 * et rate souvent. La section reste un composant serveur : pas une ligne
 * de JavaScript n'est envoyée pour elle.
 *
 * ═══ Pourquoi pas l'attribut `name` ═══
 *
 * Il rendrait le groupe exclusif — ouvrir une question refermerait la
 * précédente. Mais React repose `open` sur le premier `<details>` pendant
 * l'hydratation, et l'accordéon exclusif du navigateur referme alors
 * l'élément par lequel il vient de passer : une fois sur trois environ, la
 * première réponse se retrouvait repliée au chargement. Sans `name`,
 * plusieurs réponses peuvent rester ouvertes en même temps — ce qui, pour
 * comparer deux réponses, n'est pas une perte.
 *
 * ═══ Pourquoi cette section pèse pour le référencement ═══
 *
 * Chaque question est une requête réelle, et sa réponse est dans le HTML
 * servi, dépliée ou non. Le même contenu alimente le JSON-LD `FAQPage` de
 * la page — il n'est écrit qu'une fois, dans `home-content`, donc les deux
 * ne peuvent pas diverger.
 */
export function FaqSection({
  copy,
  whatsapp,
}: {
  copy: HomeContent["faq"];
  whatsapp: HomeContent["whatsapp"];
}) {
  return (
    <section
      id="faq"
      className={styles.section}
      data-story-section
      aria-labelledby="faq-title"
    >
      <Container className={styles.container}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <h2 id="faq-title" className={styles.title}>
            {copy.title}
          </h2>
          <p className={styles.description}>{copy.description}</p>
          <a
            className={`focus-ring ${styles.contact}`}
            href={buildWhatsAppUrl(whatsapp.message)}
            target="_blank"
            rel="noreferrer"
            aria-label={whatsapp.ariaLabel}
          >
            <WhatsAppIcon />
            {copy.contactCta}
          </a>
        </div>

        <div className={styles.list}>
          {copy.items.map((item, index) => (
            <details
              key={item.question}
              open={index === 0}
              className={styles.item}
            >
              <summary className={`focus-ring ${styles.question}`}>
                <span>{item.question}</span>
                <ChevronDown size={20} aria-hidden="true" />
              </summary>
              <p className={styles.answer}>{item.answer}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
