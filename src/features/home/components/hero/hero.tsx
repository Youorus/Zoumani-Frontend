import Image from "next/image";

import { buildWhatsAppUrl } from "@/lib/contact/build-whatsapp-url";

import { Emphasis } from "../emphasis";
import type { HomeContent } from "../home-content";
import styles from "./hero.module.css";
import { DeviceTilt } from "./device-tilt";
import { AppStoreBadge } from "./store-badges";

/**
 * Le hero : la promesse, l'application, et les trajets qu'on nous demande.
 *
 * ═══ Sombre, et c'est voulu ═══
 *
 * La page était crème de haut en bas, et le hero se confondait avec ce
 * qui le suivait. Sur l'ébène de la charte, l'orange redevient une
 * lumière et le téléphone une chose qu'on a envie de prendre. C'est
 * aussi ce qui fait qu'on sait qu'on est arrivé quelque part.
 *
 * ═══ Un visage, pas un téléphone ═══
 *
 * La scène montrait l'application. Elle montre maintenant quelqu'un qui
 * sourit : « ça fait plaisir de tomber sur une page et de voir des gens
 * avec le sourire » (une amie de Marc, 5 octobre 2026). Le mécanisme —
 * place de marché, identités vérifiées — est déjà dit par le texte à
 * gauche ; la scène n'a pas à le répéter, elle doit donner envie.
 *
 * Trois couches, comme une carte postale posée sur la table :
 *
 *   - le portrait, incliné et flottant, dans le cadre que le téléphone
 *     occupait — mêmes orbites derrière, même halo orange dessous ;
 *   - la carte d'arrivée en bas à gauche, qui dit le corridor et son
 *     issue, dans le vocabulaire de la bande qui défile en dessous ;
 *   - la vignette de l'application en haut à droite, petite : le bandeau
 *     promet un App Store, la page doit le montrer, mais ce n'est plus
 *     le sujet.
 *
 * ═══ La bande des corridors ═══
 *
 * Les grandes liaisons de la diaspora, des capitales et métropoles
 * d'Europe vers celles d'Afrique. Le libellé dit « corridors », pas
 * « desservis » : Zoumani fonctionne partout où quelqu'un publie un
 * trajet, et cette bande dit où l'on va, pas ce qui est garanti. La
 * durée du défilement suit la longueur de la liste, pour garder une
 * vitesse de lecture constante.
 */
export function Hero({
  copy,
  stores,
  whatsapp,
  signals,
}: {
  copy: HomeContent["hero"];
  stores: HomeContent["stores"];
  whatsapp: HomeContent["whatsapp"];
  signals: HomeContent["signals"];
}) {
  const [avantAccent, apresAccent] = copy.description.split("{accent}");

  return (
    <section id="telecharger" className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            <span className={styles.pulse} aria-hidden="true" />
            {copy.eyebrow}
          </p>

          <h1 id="hero-title" className={styles.title}>
            <Emphasis text={copy.title} emphasis={copy.titleEmphasis} className={styles.em} />
          </h1>

          <p className={styles.description}>
            {avantAccent}
            <strong>{copy.descriptionAccent}</strong>
            {apresAccent}
          </p>

          <div className={styles.actions}>
            <AppStoreBadge copy={stores} cta="hero-store" />
            <a
              href={buildWhatsAppUrl(whatsapp.businessMessage)}
              target="_blank"
              rel="noreferrer"
              className={`focus-ring ${styles.secondary}`}
              data-cta="hero-business"
            >
              {copy.secondaryCta}
              <span aria-hidden="true">→</span>
            </a>
          </div>
          <p className={styles.note}>{copy.note}</p>

          {/* Trois chiffres, au-dessus de la ligne de flottaison. Ils sont
              répétés plus bas en détail ; ici ils ne font qu'une chose,
              rassurer avant que le visiteur ait décidé de descendre. Ce sont
              les mêmes, pris à la même source : pas de second jeu à tenir. */}
          <dl className={styles.proof}>
            {signals.items.slice(0, 3).map((item) => (
              <div key={item.label} className={styles.proofItem}>
                <dt className={styles.proofValue}>{item.value}</dt>
                <dd className={styles.proofLabel}>{item.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className={styles.stage}>
          {/* Les orbites : trois cercles fins derrière le téléphone, comme
              des trajets autour d'un point. Décoratifs, et seuls. */}
          <svg className={styles.orbits} viewBox="0 0 600 600" aria-hidden="true">
            <circle cx="300" cy="300" r="150" />
            <circle cx="300" cy="300" r="220" />
            <circle cx="300" cy="300" r="290" />
            <circle className={styles.satellite} cx="300" cy="80" r="4" />
            <circle className={styles.satelliteSlow} cx="300" cy="10" r="3" />
          </svg>
          <div className={styles.glow} aria-hidden="true" />
          <DeviceTilt className={styles.tilt}>
            <figure className={styles.portrait}>
              <div className={styles.portraitFrame}>
                <Image
                  src="/images/hero/zoumani-sourire-pagne.webp"
                  alt={copy.portraitAlt}
                  fill
                  priority
                  sizes="(max-width: 64rem) 18rem, 23rem"
                  className={styles.portraitImage}
                />
              </div>

              {/* L'arrivée, posée sur la photo : le corridor et son issue. Le
                  même vocabulaire que la bande qui défile en dessous. */}
              <figcaption className={styles.arrival}>
                <span className={styles.arrivalRoute}>{copy.arrivalRoute}</span>
                <span className={styles.arrivalStatus}>
                  <svg viewBox="0 0 16 16" aria-hidden="true" className={styles.arrivalCheck}>
                    <path d="M3 8.4l3.2 3.2L13 4.8" />
                  </svg>
                  {copy.arrivalStatus}
                </span>
              </figcaption>

              {/* Les gages, posés sur la photo : ce que la description promet
                  à gauche, montré là où le regard se pose. */}
              {copy.badges.map((badge, rang) => (
                <span
                  key={badge}
                  className={`${styles.badge} ${rang === 0 ? styles.badgeOne : styles.badgeTwo}`}
                >
                  <svg viewBox="0 0 16 16" aria-hidden="true" className={styles.badgeCheck}>
                    <path d="M3 8.4l3.2 3.2L13 4.8" />
                  </svg>
                  {badge}
                </span>
              ))}

              {/* L'application ne disparaît pas : elle passe au second plan.
                  Le bandeau promet un App Store, la page doit le montrer. */}
              <span className={styles.appChip}>
                <Image
                  src="/images/hero/zoumani-app-screen.webp"
                  alt={copy.appChipAlt}
                  fill
                  sizes="7rem"
                  className={styles.appChipImage}
                />
              </span>
            </figure>
          </DeviceTilt>
        </div>
      </div>

      <div className={styles.ticker}>
        <p className={styles.tickerLabel}>{copy.tickerLabel}</p>
        <div className={styles.tickerViewport}>
          <ul
            className={`marquee ${styles.tickerTrack}`}
            style={{ "--marquee-duration": `${copy.ticker.length * 4}s` } as React.CSSProperties}
          >
            {[...copy.ticker, ...copy.ticker].map((trajet, index) => (
              <li
                key={`${trajet}-${index}`}
                className={styles.tickerItem}
                aria-hidden={index >= copy.ticker.length}
              >
                {trajet}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
