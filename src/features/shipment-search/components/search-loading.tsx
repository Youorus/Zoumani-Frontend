import { MapPin, PackageCheck, Route, ShieldCheck } from "lucide-react";

import type { HomeLanguage } from "@/features/home/components/home-content";

import { shipmentSearchContent } from "../content/search-content";
import styles from "./shipment-search.module.css";

const stageIcons = [Route, PackageCheck, ShieldCheck] as const;

export function SearchLoading({
  filters,
  language,
}: {
  filters?: { from: string; to: string; weight: number };
  language: HomeLanguage;
}) {
  const copy = shipmentSearchContent[language].loading;

  return (
    <section
      className={styles.loading}
      aria-live="polite"
      aria-busy="true"
      data-search-loading=""
    >
      <div className={styles.loaderCanvas} aria-hidden="true">
        <svg
          className={styles.loaderRoute}
          viewBox="0 0 680 190"
          preserveAspectRatio="none"
        >
          <path d="M35 95C154 18 248 168 340 95S526 20 645 95" />
          <path pathLength="1" d="M35 95C154 18 248 168 340 95S526 20 645 95" />
        </svg>
        <span className={`${styles.loaderNode} ${styles.loaderOrigin}`}>
          <MapPin size={17} />
        </span>
        <span className={styles.loaderParcel}>
          <PackageCheck size={27} />
        </span>
        <span className={`${styles.loaderNode} ${styles.loaderDestination}`}>
          <MapPin size={17} />
        </span>
      </div>

      <p className={styles.eyebrow}>{copy.eyebrow}</p>
      <h1>{copy.title}</h1>
      <p className={styles.loadingDescription}>{copy.description}</p>
      <ul className={styles.loadingStages}>
        {copy.stages.map((stage, index) => {
          const Icon = stageIcons[index];
          return (
            <li key={stage}>
              <Icon size={15} />
              {stage}
            </li>
          );
        })}
      </ul>
      {filters ? (
        <span className="sr-only">
          {filters.from}, {filters.to}, {filters.weight} kg
        </span>
      ) : null}
    </section>
  );
}
