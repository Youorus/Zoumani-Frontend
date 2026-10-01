import { Container } from "@/components/layout/container";

import { Emphasis } from "../emphasis";
import type { HomeContent } from "../home-content";
import { CITIES, MAP_CROP_HEIGHT, MAP_WIDTH, type CityId } from "./map-data";
import styles from "./reach-section.module.css";

/**
 * Le colis qui n'attend plus : la carte.
 *
 * ═══ Ce que la carte montre ═══
 *
 * L'Europe et l'Afrique en points, sur l'ébène de la charte. Dix villes
 * européennes s'allument en orange — des expéditeurs — et des arcs
 * partent vers les capitales africaines. Un point court le long de
 * chaque arc : c'est le colis. C'est l'image des liaisons de la
 * diaspora, celle qu'un visiteur reconnaît en une seconde.
 *
 * La carte en points est un fichier SVG servi et mis en cache
 * (`public/images/carte-europe-afrique.svg`) ; seuls les arcs, les villes
 * et les étiquettes sont dans le HTML, sur la même grille de projection.
 *
 * ═══ Ce qui est écrit, et ce qui ne l'est pas ═══
 *
 * « Partout en Europe » parle de la diaspora, pas d'un compteur. La
 * légende dit où le réseau Mondial Relay existe réellement et ce qui se
 * passe ailleurs — une remise en main propre — pour que personne à
 * Berlin ne cherche un relais qui n'existe pas.
 */

/** Les liaisons dessinées : de l'expéditeur vers la destination. */
const ROUTES: ReadonlyArray<{ from: CityId; to: CityId; bow: number }> = [
  { from: "paris", to: "dakar", bow: -0.28 },
  { from: "paris", to: "douala", bow: 0.08 },
  { from: "paris", to: "abidjan", bow: -0.14 },
  { from: "bruxelles", to: "kinshasa", bow: 0.18 },
  { from: "lyon", to: "casablanca", bow: -0.16 },
  { from: "marseille", to: "alger", bow: 0.28 },
  { from: "londres", to: "lagos", bow: -0.22 },
  { from: "lisbonne", to: "luanda", bow: -0.06 },
  { from: "madrid", to: "bamako", bow: -0.2 },
  { from: "rome", to: "tunis", bow: 0.32 },
  { from: "milan", to: "nairobi", bow: 0.16 },
];

const SENDERS: readonly CityId[] = [
  "paris",
  "bruxelles",
  "lyon",
  "marseille",
  "londres",
  "lisbonne",
  "madrid",
  "milan",
  "rome",
];

const LABELS: Readonly<Record<CityId, string>> = {
  paris: "Paris",
  bruxelles: "Bruxelles",
  lyon: "Lyon",
  marseille: "Marseille",
  geneve: "Genève",
  londres: "Londres",
  lisbonne: "Lisbonne",
  madrid: "Madrid",
  milan: "Milan",
  rome: "Rome",
  dakar: "Dakar",
  bamako: "Bamako",
  abidjan: "Abidjan",
  accra: "Accra",
  lagos: "Lagos",
  douala: "Douala",
  kinshasa: "Kinshasa",
  casablanca: "Casablanca",
  alger: "Alger",
  tunis: "Tunis",
  nairobi: "Nairobi",
  antananarivo: "Antananarivo",
  luanda: "Luanda",
  conakry: "Conakry",
};

/** Les villes dont l'étiquette se pose à gauche du point, faute de place à droite. */
const LABEL_LEFT: ReadonlySet<CityId> = new Set([
  "lisbonne",
  "madrid",
  "londres",
  "lyon",
  "dakar",
  "conakry",
  "casablanca",
]);

/**
 * Un arc quadratique dont le point de contrôle est décalé
 * perpendiculairement à la corde : `bow` négatif courbe vers l'ouest
 * (l'Atlantique), positif vers l'est.
 */
function arc(from: CityId, to: CityId, bow: number): string {
  const [x1, y1] = CITIES[from];
  const [x2, y2] = CITIES[to];
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy);
  const nx = dy / length;
  const ny = -dx / length;
  const cx = (x1 + x2) / 2 + nx * length * bow;
  const cy = (y1 + y2) / 2 + ny * length * bow;
  return `M ${x1} ${y1} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${x2} ${y2}`;
}

export function ReachSection({ copy }: { copy: HomeContent["reach"] }) {
  const destinations = Array.from(new Set(ROUTES.map((r) => r.to)));

  return (
    <section className={styles.section} data-story-section aria-labelledby="reach-title">
      <Container className={styles.grid}>
        <div className={styles.lead}>
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <h2 id="reach-title" className={styles.title}>
            <Emphasis text={copy.title} emphasis={copy.titleEmphasis} />
          </h2>
          <p className={styles.description}>{copy.description}</p>

          <ol className={styles.steps}>
            <li className={styles.step}>
              <span className={styles.stepIndex}>1</span>
              <div>
                <p className={styles.stepTitle}>{copy.senders.label}</p>
                <p className={styles.stepDetail}>{copy.senders.cities.join(" · ")}</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepIndex}>2</span>
              <div>
                <p className={styles.stepTitle}>{copy.relay.title}</p>
                <p className={styles.stepDetail}>{copy.relay.detail}</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepIndex}>3</span>
              <div>
                <p className={styles.stepTitle}>{copy.traveler.title}</p>
                <p className={styles.stepDetail}>{copy.traveler.detail}</p>
              </div>
            </li>
          </ol>
          <p className={styles.caption}>{copy.caption}</p>
        </div>

        <figure className={styles.map} aria-label={`${copy.senders.label} → ${copy.traveler.title}`}>
          <svg
            className={styles.overlay}
            viewBox={`0 0 ${MAP_WIDTH} ${MAP_CROP_HEIGHT}`}
            role="img"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="reach-arc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="var(--secondary)" stopOpacity="0.9" />
                <stop offset="1" stopColor="var(--primary)" stopOpacity="0.55" />
              </linearGradient>
              <radialGradient id="reach-halo">
                <stop offset="0" stopColor="var(--primary)" stopOpacity="0.55" />
                <stop offset="1" stopColor="var(--primary)" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Les arcs. */}
            {ROUTES.map((route, index) => {
              const d = arc(route.from, route.to, route.bow);
              return (
                <g key={`${route.from}-${route.to}`}>
                  <path className={styles.arc} d={d} />
                  <circle className={styles.parcel} r="4.5">
                    <animateMotion
                      dur={`${5.5 + (index % 4) * 0.9}s`}
                      begin={`${(index * 0.7).toFixed(1)}s`}
                      repeatCount="indefinite"
                      path={d}
                    />
                  </circle>
                </g>
              );
            })}

            {/* Les destinations. */}
            {destinations.map((id) => {
              const [x, y] = CITIES[id];
              const left = LABEL_LEFT.has(id);
              return (
                <g key={id} className={styles.destination}>
                  <circle cx={x} cy={y} r="4" />
                  <text x={left ? x - 10 : x + 10} y={y + 4.5} textAnchor={left ? "end" : "start"}>
                    {LABELS[id]}
                  </text>
                </g>
              );
            })}

            {/* Les expéditeurs, allumés. */}
            {SENDERS.map((id, index) => {
              const [x, y] = CITIES[id];
              const left = LABEL_LEFT.has(id);
              return (
                <g key={id} className={styles.sender}>
                  <circle cx={x} cy={y} r="22" fill="url(#reach-halo)" />
                  <circle
                    cx={x}
                    cy={y}
                    r="5"
                    className={styles.ping}
                    style={{ animationDelay: `${index * 0.4}s` }}
                  />
                  <circle cx={x} cy={y} r="4.5" />
                  <text x={left ? x - 10 : x + 10} y={y + 4.5} textAnchor={left ? "end" : "start"}>
                    {LABELS[id]}
                  </text>
                </g>
              );
            })}
          </svg>
        </figure>
      </Container>
    </section>
  );
}
