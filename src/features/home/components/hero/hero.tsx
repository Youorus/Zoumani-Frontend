import Image from "next/image";

import { buildWhatsAppUrl } from "@/lib/contact/build-whatsapp-url";

import { Emphasis } from "../emphasis";
import type { HomeContent } from "../home-content";
import styles from "./hero.module.css";
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
 * Les étiquettes posées dessus sont des faits du produit, pas des
 * slogans.
 *
 * ═══ La bande des trajets ═══
 *
 * Ce sont les trajets réellement demandés — préinscriptions, voyages
 * publiés, agences démarchées — pas une liste de pays inventée. Le
 * libellé le dit : « qu'on nous demande le plus », pas « desservis ».
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

        <div className={styles.stage} aria-hidden="false">
          <div className={styles.glow} aria-hidden="true" />
          <figure className={styles.device}>
            <div className={styles.screen}>
              <Image
                src="/images/hero/zoumani-app-screen.webp"
                alt={copy.phoneAlt}
                fill
                priority
                sizes="(max-width: 64rem) 16rem, 20rem"
                className={styles.screenImage}
              />
            </div>
          </figure>
          <ul className={styles.chips} aria-label={copy.eyebrow}>
            {copy.chips.map((chip, index) => (
              <li key={chip} className={styles.chip} data-index={index}>
                <svg viewBox="0 0 20 20" aria-hidden="true" className={styles.chipIcon}>
                  <circle cx="10" cy="10" r="9" />
                  <path d="m6 10.5 2.6 2.5L14 7.5" />
                </svg>
                {chip}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.ticker}>
        <p className={styles.tickerLabel}>{copy.tickerLabel}</p>
        <div className={styles.tickerViewport}>
          <ul className={`marquee ${styles.tickerTrack}`}>
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
