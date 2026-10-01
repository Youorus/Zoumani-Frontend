import { Container } from "@/components/layout/container";

import { Emphasis } from "../emphasis";
import type { HomeContent } from "../home-content";
import styles from "./reach-section.module.css";

/**
 * Le colis qui n'attend plus : dessiné.
 *
 * ═══ Ce que le schéma montre ═══
 *
 * À gauche, des villes d'Europe — autant d'expéditeurs. Au milieu, un
 * seul nœud : le point relais Mondial Relay près de chez eux. À droite,
 * le voyageur vérifié qui part, et l'avion. Les lignes convergent vers
 * le relais puis repartent d'un seul trait : c'est exactement ce que
 * Zoumani change — le colis ne cherche plus quelqu'un du quartier, il
 * rejoint celui qui part.
 *
 * Un point orange court le long des lignes : c'est le colis. En
 * mouvement réduit, il reste à sa place et le schéma se lit en statique.
 *
 * ═══ Ce qui est écrit, et ce qui ne l'est pas ═══
 *
 * « Partout en Europe » parle de la diaspora, pas d'un compteur : des
 * familles ont un colis à faire partir, c'est le marché. La légende dit
 * où le réseau Mondial Relay existe réellement et ce qui se passe
 * ailleurs — une remise en main propre — pour que personne à Berlin ne
 * cherche un relais qui n'existe pas.
 */
export function ReachSection({ copy }: { copy: HomeContent["reach"] }) {
  const villes = copy.senders.cities;
  const n = villes.length;
  // Les points de départ sont répartis sur la hauteur du schéma.
  const departs = villes.map((_, i) => 40 + (i * 320) / Math.max(1, n - 1));
  const relais = { x: 420, y: 200 };
  const voyageur = { x: 700, y: 200 };

  return (
    <section className={styles.section} data-story-section aria-labelledby="reach-title">
      <Container className={styles.container}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <h2 id="reach-title" className={styles.title}>
            <Emphasis text={copy.title} emphasis={copy.titleEmphasis} />
          </h2>
          <p className={styles.description}>{copy.description}</p>
        </div>

        <figure className={styles.figure}>
          <div className={styles.columns} aria-hidden="true">
            <span>{copy.senders.label}</span>
            <span>{copy.relay.label}</span>
            <span>{copy.traveler.label}</span>
          </div>

          <svg
            className={styles.diagram}
            viewBox="0 0 800 400"
            role="img"
            aria-label={`${copy.senders.label} → ${copy.relay.title} → ${copy.traveler.title}`}
          >
            {/* Les lignes des expéditeurs vers le relais. */}
            {departs.map((y, i) => (
              <path
                key={villes[i]}
                className={styles.line}
                d={`M 150 ${y} C 290 ${y}, 300 ${relais.y}, ${relais.x - 26} ${relais.y}`}
              />
            ))}
            {/* Le trait unique du relais au voyageur. */}
            <path
              className={styles.trunk}
              d={`M ${relais.x + 26} ${relais.y} L ${voyageur.x - 30} ${voyageur.y}`}
            />

            {/* Les expéditeurs. */}
            {departs.map((y, i) => (
              <g key={villes[i]} className={styles.sender}>
                <circle cx="150" cy={y} r="6" />
                <circle cx="150" cy={y} r="6" className={styles.pulse} style={{ animationDelay: `${i * 0.35}s` }} />
                <text x="134" y={y + 5} textAnchor="end">
                  {villes[i]}
                </text>
              </g>
            ))}

            {/* Le relais. */}
            <g className={styles.relay}>
              <circle cx={relais.x} cy={relais.y} r="26" />
              <path
                d={`M ${relais.x} ${relais.y - 11} l 10 5.5 v 11 l -10 5.5 l -10 -5.5 v -11 z M ${relais.x - 10} ${relais.y - 5.5} l 10 5.5 l 10 -5.5 M ${relais.x} ${relais.y} v 11`}
              />
            </g>

            {/* Le voyageur et l'avion. */}
            <g className={styles.traveler}>
              <circle cx={voyageur.x} cy={voyageur.y} r="30" />
              <path
                d={`M ${voyageur.x - 14} ${voyageur.y + 8} l 28 -16 l -6 2 l -8 10 l -8 -1 l -3 3 l 6 3 l 3 6 l 3 -3 l -1 -8 l 10 -8 z`}
              />
            </g>

            {/* Le colis qui avance : un point orange le long d'un trajet. */}
            <circle className={styles.parcel} r="5">
              <animateMotion
                dur="6s"
                repeatCount="indefinite"
                path={`M 150 ${departs[Math.floor(n / 2)] ?? 200} C 290 ${departs[Math.floor(n / 2)] ?? 200}, 300 ${relais.y}, ${relais.x - 26} ${relais.y} M ${relais.x + 26} ${relais.y} L ${voyageur.x - 30} ${voyageur.y}`}
              />
            </circle>
          </svg>

          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <p className={styles.legendTitle}>{copy.relay.title}</p>
              <p className={styles.legendDetail}>{copy.relay.detail}</p>
            </div>
            <div className={styles.legendItem}>
              <p className={styles.legendTitle}>{copy.traveler.title}</p>
              <p className={styles.legendDetail}>{copy.traveler.detail}</p>
            </div>
          </div>
          <figcaption className={styles.caption}>{copy.caption}</figcaption>
        </figure>
      </Container>
    </section>
  );
}
