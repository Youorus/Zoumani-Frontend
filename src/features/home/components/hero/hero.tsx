import Image from "next/image";
import {
  Globe2,
  MapPin,
  PackageCheck,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import type { HomeContent } from "../home-content";
import styles from "./hero.module.css";
import { PhoneMockup } from "./phone-mockup";
import { StoreBadges } from "./store-badges";

const TRUST_ICONS = [ShieldCheck, PackageCheck, UsersRound] as const;

export function Hero({
  copy,
  stores,
}: {
  copy: HomeContent["hero"];
  stores: HomeContent["stores"];
}) {
  const [beforeAccent, afterAccent] = copy.description.split("{accent}");

  return (
    <section id="telecharger" className={styles.hero}>
      <div className={styles.photoLayer} aria-hidden="true">
        <Image
          src="/images/hero/zoumani-airport-campaign.webp"
          alt=""
          fill
          preload
          sizes="100vw"
          className={styles.photo}
        />
        <span className={styles.photoScrim} />
      </div>

      <span className={styles.orangeRoute} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            <Globe2 aria-hidden="true" />
            {copy.eyebrow}
          </p>

          <h1 className={styles.title}>
            <span className={styles.titlePrimary}>{copy.titleLineOne}</span>
            <span className={styles.titleAccent}>{copy.titleLineTwo}</span>
          </h1>

          <p className={styles.description}>
            {beforeAccent}
            <strong>{copy.descriptionAccent}</strong>
            {afterAccent}
          </p>
        </div>

        <ul id="securite" className={styles.trust}>
          {copy.trust.map((item, index) => {
            const Icon = TRUST_ICONS[index] ?? ShieldCheck;
            return (
              <li key={item.title} className={styles.trustItem}>
                <span className={styles.trustIcon}>
                  <Icon aria-hidden="true" />
                </span>
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.detail}</small>
                </span>
              </li>
            );
          })}
        </ul>

        <div className={styles.downloadCard}>
          <p>{copy.downloadTitle}</p>
          <StoreBadges
            copy={stores}
            alwaysInline
            className={styles.storeBadges}
          />
        </div>

        <div className={styles.phoneStage}>
          <PhoneMockup />
        </div>
      </div>

      <div className={styles.routeLine} aria-hidden="true">
        <svg viewBox="0 0 1000 90" preserveAspectRatio="none">
          <path d="M0 75C320 82 555 86 790 54c86-12 143-29 210-49" />
        </svg>
        <span>
          <MapPin />
        </span>
      </div>
    </section>
  );
}
