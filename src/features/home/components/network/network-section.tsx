import type { ReactElement, SVGProps } from "react";

import { Container } from "@/components/layout/container";

import type { HomeContent } from "../home-content";
import styles from "./network-section.module.css";

/**
 * Le réseau : avec qui le colis avance, au-delà du voyageur.
 *
 * ═══ Pourquoi pas le mur de logos ═══
 *
 * `TrustedPartners` montre treize marques sous un titre qui laisse croire
 * à des partenariats. Aucun n'est conclu, et la section reste masquée.
 * Celle-ci ne nomme que ce qui fonctionne réellement : les entreprises de
 * fret vérifiées (ADR-0031 du backend) et le dépôt en point relais Mondial
 * Relay, branché en production. Mondial Relay est cité **par son nom,
 * sans logo** : un logo se lit comme un partenariat, un nom comme un
 * service qu'on utilise — et c'est ce qu'il est.
 *
 * ═══ L'assurance est au futur, et marquée comme telle ═══
 *
 * Elle est éteinte côté serveur, faute d'assureur. La carte existe parce
 * que la question « mon colis est-il assuré ? » se pose de toute façon ;
 * elle y répond honnêtement plutôt que de laisser un silence qu'on
 * remplirait d'une supposition. L'étiquette « Bientôt » et le registre du
 * texte disent la même chose : ce n'est pas ouvert.
 *
 * ═══ L'ancre ═══
 *
 * `#partenaires`, que le menu et le pied de page visaient déjà alors que
 * la section des logos était masquée : le lien ne menait nulle part.
 */
export function NetworkSection({ copy }: { copy: HomeContent["network"] }) {
  return (
    <section
      id="partenaires"
      className={styles.section}
      data-story-section
      aria-labelledby="network-title"
    >
      <Container className={styles.container}>
        <p className={styles.eyebrow}>{copy.eyebrow}</p>
        <h2 id="network-title" className={styles.title}>
          {copy.title}
        </h2>
        <p className={styles.description}>{copy.description}</p>

        <ul className={styles.cards}>
          {copy.cards.map((carte) => {
            const Icone = ICONES[carte.id];
            return (
              <li
                key={carte.id}
                className={styles.card}
                data-soon={carte.soon ? "true" : undefined}
              >
                <div className={styles.cardHead}>
                  <span className={styles.icon} aria-hidden="true">
                    <Icone />
                  </span>
                  {carte.soon && (
                    <span className={styles.soon}>{copy.soonLabel}</span>
                  )}
                </div>
                <p className={styles.tag}>{carte.tag}</p>
                <h3 className={styles.cardTitle}>{carte.title}</h3>
                <p className={styles.cardDetail}>{carte.detail}</p>
              </li>
            );
          })}
        </ul>

        <p className={styles.trademark}>{copy.trademark}</p>
      </Container>
    </section>
  );
}

type Icone = (props: SVGProps<SVGSVGElement>) => ReactElement;

/** Un avion-cargo : l'entreprise de fret. */
function IconeFret(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path
        d="M3 13.5 21 8l-1.2-2.1a2 2 0 0 0-2.3-.9L13 6.4 7.6 3.8 5.8 4.4l3.3 3.4-3.6 1.1-2-1.4L2 7.9l1 5.6Z"
        strokeLinejoin="round"
      />
      <path d="M4 20h16" strokeLinecap="round" />
    </svg>
  );
}

/** Un repère de carte : le point relais près de chez soi. */
function IconeRelais(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path
        d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"
        strokeLinejoin="round"
      />
      <path d="M9.5 9.5 12 8l2.5 1.5v2.8L12 13.8l-2.5-1.5Z" strokeLinejoin="round" />
    </svg>
  );
}

/** Un bouclier : la protection du colis. */
function IconeAssurance(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path
        d="M12 3 5 5.8v5.4c0 4.4 3 8.1 7 9.8 4-1.7 7-5.4 7-9.8V5.8L12 3Z"
        strokeLinejoin="round"
      />
      <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ICONES: Record<HomeContent["network"]["cards"][number]["id"], Icone> = {
  fret: IconeFret,
  relais: IconeRelais,
  assurance: IconeAssurance,
};
