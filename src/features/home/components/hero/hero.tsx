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
 * ═══ Le téléphone est revenu ═══
 *
 * Il avait été retiré parce que l'application n'existait pas : montrer
 * une offre qu'on n'a pas est le plus court chemin vers la déception.
 * Elle existe maintenant, sur l'App Store, et l'écran montré est le sien.
 *
 * Le cadre est dessiné en CSS, en trois couches — tranche, lunette,
 * écran — avec ses boutons, un reflet sur la vitre et une inclinaison en
 * perspective : c'est ce qui le fait lire comme un objet et non comme
 * une capture dans un rectangle arrondi. Il flotte lentement, suit le
 * pointeur de quelques degrés, et trois orbites fines tournent derrière
 * lui. Rien d'autre : les étiquettes qui le survolaient cachaient
 * l'écran et disaient ce que le reste de la page dit mieux.
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
}: {
  copy: HomeContent["hero"];
  stores: HomeContent["stores"];
  whatsapp: HomeContent["whatsapp"];
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
            <figure className={styles.device}>
              <span className={styles.buttonMute} aria-hidden="true" />
              <span className={styles.buttonVolumeUp} aria-hidden="true" />
              <span className={styles.buttonVolumeDown} aria-hidden="true" />
              <span className={styles.buttonPower} aria-hidden="true" />
              <div className={styles.screen}>
                <Image
                  src="/images/hero/zoumani-app-screen.webp"
                  alt={copy.phoneAlt}
                  fill
                  priority
                  sizes="(max-width: 64rem) 17rem, 21rem"
                  className={styles.screenImage}
                />
                <span className={styles.glare} aria-hidden="true" />
              </div>
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
