import { ArrowRight, ArrowUpRight, Package } from "lucide-react";
import Image from "next/image";

import { buildWhatsAppUrl } from "@/lib/contact/build-whatsapp-url";

import type { HomeContent } from "../home-content";
import styles from "./hero.module.css";
import { StoreBadges } from "./store-badges";

export function Hero({ copy, stores, whatsapp }: {
  copy: HomeContent["hero"];
  stores: HomeContent["stores"];
  whatsapp: HomeContent["whatsapp"];
}) {
  const [title, afterTitle] = copy.title.split("{em}");
  const [beforeAccent, afterAccent] = copy.description.split("{accent}");
  const [origin, destination] = copy.arrivalRoute.split(" → ");

  return (
    <section id="telecharger" className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            <span aria-hidden="true" />
            {copy.eyebrow}
          </p>
          <h1 id="hero-title" className={styles.title}>
            {title}<br /><em>{copy.titleEmphasis}</em>{afterTitle}
          </h1>
          <p className={styles.description}>
            {beforeAccent}<strong>{copy.descriptionAccent}</strong>{afterAccent}
          </p>
          <div className={styles.downloads}>
            <StoreBadges copy={stores} cta="hero-stores" alwaysInline className={styles.storeBadges} />
          </div>
          <a
            href={buildWhatsAppUrl(whatsapp.businessMessage)}
            target="_blank"
            rel="noreferrer"
            className={styles.business}
            data-cta="hero-business"
            data-intent-role="business"
          >
            {copy.secondaryCta}<ArrowUpRight size={15} aria-hidden="true" />
          </a>
          <p className={styles.note}>{copy.note}</p>
        </div>
        <div className={styles.stage}>
          <div className={styles.orbit} aria-hidden="true" />
          <figure className={styles.portrait}>
            <Image
              src="/images/hero/zoumani-sourire-pagne.webp"
              alt={copy.portraitAlt}
              fill
              sizes="(max-width: 600px) 82vw, (max-width: 1000px) 55vw, 440px"
              loading="eager"
              fetchPriority="high"
              className={styles.portraitImage}
            />
            <figcaption className={styles.caption}>
              {copy.photoCaption}<br /><strong>{copy.photoCaptionEmphasis}</strong>
            </figcaption>
          </figure>
          <div className={styles.device}>
            <Image
              src="/images/hero/zoumani-app-screen.webp"
              alt={copy.appChipAlt}
              width={1290}
              height={2796}
              sizes="(max-width: 600px) 110px, 150px"
              className={styles.appImage}
            />
          </div>
          <div className={styles.route}>
            <span className={styles.routeIcon}><Package size={20} aria-hidden="true" /></span>
            <div>
              <span className={styles.routeLabel}>{copy.routeExampleLabel}</span>
              <strong>{origin}<ArrowRight size={16} aria-hidden="true" />{destination}</strong>
              <span className={styles.routeTypes}>{copy.routeTypes}</span>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.ticker}>
        <p className={styles.tickerLabel}>{copy.tickerLabel}</p>
        <div className={styles.tickerViewport}>
          <ul className={`marquee ${styles.tickerTrack}`}>
            {[...copy.ticker, ...copy.ticker].map((corridor, index) => (
              <li key={`${corridor}-${index}`} className={styles.tickerItem} aria-hidden={index >= copy.ticker.length}>
                {corridor}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
