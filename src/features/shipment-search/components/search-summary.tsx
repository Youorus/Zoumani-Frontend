import { ArrowRight, MapPin, Package, Pencil } from "lucide-react";
import Link from "next/link";

import type { HomeLanguage } from "@/features/home/components/home-content";

import { shipmentSearchContent } from "../content/search-content";
import { formatSearchCity } from "../data/search-cities";
import type { TripSearchFilters } from "../schemas/trip-search.schema";
import styles from "./shipment-search.module.css";

export function SearchSummary({
  filters,
  language,
}: {
  filters: TripSearchFilters;
  language: HomeLanguage;
}) {
  const copy = shipmentSearchContent[language].summary;

  return (
    <div className={styles.summary} aria-label={copy.routeLabel}>
      <div className={styles.summaryCity}>
        <span className={styles.summaryIcon} aria-hidden="true">
          <MapPin size={17} />
        </span>
        <span>
          <small>{language === "fr" ? "Départ" : "From"}</small>
          <strong>{formatSearchCity(filters.from)}</strong>
        </span>
      </div>
      <span className={styles.summaryArrow} aria-hidden="true">
        <ArrowRight size={17} />
      </span>
      <div className={`${styles.summaryCity} ${styles.destination}`}>
        <span className={styles.summaryIcon} aria-hidden="true">
          <MapPin size={17} />
        </span>
        <span>
          <small>{language === "fr" ? "Arrivée" : "To"}</small>
          <strong>{formatSearchCity(filters.to)}</strong>
        </span>
      </div>
      <div className={styles.summaryParcel}>
        <small>{copy.parcelLabel}</small>
        <strong>
          <Package size={14} aria-hidden="true" /> {filters.weight} kg
        </strong>
      </div>
      <Link className={`${styles.editLink} focus-ring`} href="/#search">
        <Pencil size={13} aria-hidden="true" />
        {copy.editLabel}
      </Link>
    </div>
  );
}
