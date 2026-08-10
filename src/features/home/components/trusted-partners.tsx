import Image from "next/image";
import { ShieldCheck } from "lucide-react";

import {
  trustedPartners,
  type PartnerCategory,
  type TrustedPartner,
} from "../data/trusted-partners";
import type { HomeContent } from "./home-content";
import styles from "./trusted-partners.module.css";

interface PartnerListProps {
  partners: readonly TrustedPartner[];
  category: PartnerCategory;
  duplicate?: boolean;
}

function PartnerList({ partners, category, duplicate = false }: PartnerListProps) {
  return (
    <ul
      aria-hidden={duplicate || undefined}
      className={`${styles.group} ${duplicate ? styles.duplicate : ""}`}
    >
      {partners.map((partner) => (
        <li
          key={partner.name}
          className={`${styles.partner} ${
            category === "insurance" ? styles.insurancePartner : ""
          }`}
          title={partner.name}
        >
          <Image
            src={partner.logo}
            alt={duplicate ? "" : partner.name}
            width={partner.logoWidth}
            height={partner.logoHeight}
            loading="eager"
            className={styles.logo}
          />
          {partner.visualLabel ? (
            <span className={styles.visualLabel} aria-hidden="true">{partner.visualLabel}</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

interface PartnerMarqueeProps {
  category: PartnerCategory;
  label: string;
  partners: readonly TrustedPartner[];
  reverse?: boolean;
}

function PartnerMarquee({ category, label, partners, reverse = false }: PartnerMarqueeProps) {
  return (
    <div className={styles.marqueeRow}>
      <p className={styles.rowLabel}>
        {category === "insurance" ? <ShieldCheck aria-hidden="true" size={15} /> : null}
        {label}
      </p>
      <div className={styles.viewport} aria-label={label}>
        <div className={`${styles.track} ${reverse ? styles.trackReverse : ""}`}>
          <PartnerList partners={partners} category={category} />
          <PartnerList partners={partners} category={category} duplicate />
        </div>
      </div>
    </div>
  );
}

export function TrustedPartners({ copy }: { copy: HomeContent["partners"] }) {
  const logisticsPartners = trustedPartners.filter(({ category }) => category === "logistics");
  const insurancePartners = trustedPartners.filter(({ category }) => category === "insurance");

  return (
    <section
      id="partners"
      className={`${styles.section} scroll-mt-24 py-10 sm:py-12`}
      aria-labelledby="trusted-partners-title"
    >
      <div className="mx-auto max-w-[760px] px-5 text-center sm:px-8">
        <p className="text-xs font-bold tracking-[0.16em] text-primary uppercase">{copy.eyebrow}</p>
        <h2
          id="trusted-partners-title"
          className="mt-2 font-sans text-2xl leading-tight font-extrabold tracking-[-0.03em] text-marketing-panel-foreground sm:text-[1.75rem]"
        >
          {copy.title}
        </h2>
        <p className="mx-auto mt-2 max-w-[650px] text-sm leading-6 text-marketing-panel-muted-foreground">
          {copy.description}
        </p>
      </div>

      <div className={styles.protectionCallout}>
        <span className={styles.protectionIcon} aria-hidden="true">
          <ShieldCheck size={28} strokeWidth={1.8} />
        </span>
        <div>
          <p className={styles.protectionEyebrow}>{copy.protectionEyebrow}</p>
          <h3 className={styles.protectionTitle}>{copy.protectionTitle}</h3>
          <p className={styles.protectionDescription}>{copy.protectionDescription}</p>
        </div>
      </div>

      <div className={styles.marqueeStack} aria-label={copy.listLabel}>
        <PartnerMarquee
          category="logistics"
          label={copy.logisticsLabel}
          partners={logisticsPartners}
        />
        <PartnerMarquee
          category="insurance"
          label={copy.insuranceLabel}
          partners={insurancePartners}
          reverse
        />
      </div>

      <p className="mt-5 px-5 text-center text-[0.7rem] leading-5 text-marketing-panel-muted-foreground">
        {copy.disclaimer}
      </p>
    </section>
  );
}
