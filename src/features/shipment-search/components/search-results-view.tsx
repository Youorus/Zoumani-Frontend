"use client";

import { CheckCircle2, RefreshCw, ShieldCheck } from "lucide-react";

import type { HomeLanguage } from "@/features/home/components/home-content";

import { shipmentSearchContent } from "../content/search-content";
import { useTripSearch } from "../hooks/use-trip-search";
import type { TripSearchFilters } from "../schemas/trip-search.schema";
import { EmptySearchResults } from "./empty-search-results";
import { SearchLoading } from "./search-loading";
import { SearchSummary } from "./search-summary";
import styles from "./shipment-search.module.css";
import { TravelerResultCard } from "./traveler-result-card";

export function SearchResultsView({
  filters,
  language,
}: {
  filters: TripSearchFilters;
  language: HomeLanguage;
}) {
  const search = useTripSearch(filters);
  const copy = shipmentSearchContent[language];

  if (search.isPending) {
    return <SearchLoading filters={filters} language={language} />;
  }

  if (search.isError) {
    return (
      <div className={styles.shell}>
        <SearchSummary filters={filters} language={language} />
        <section className={styles.errorCard} role="alert">
          <span className={styles.errorIcon} aria-hidden="true">
            <RefreshCw size={23} />
          </span>
          <h2>{copy.error.title}</h2>
          <p className={styles.cardDescription}>{copy.error.description}</p>
          <button
            className={`${styles.retryButton} focus-ring`}
            type="button"
            onClick={() => search.refetch()}
          >
            {copy.error.retryLabel}
          </button>
        </section>
      </div>
    );
  }

  if (search.data.length === 0) {
    return (
      <div className={styles.shell} data-search-page="empty">
        <div className={styles.emptyHero}>
          <p className={styles.eyebrow}>{copy.empty.eyebrow}</p>
          <h1>{copy.empty.title}</h1>
          <p>{copy.empty.description}</p>
        </div>
        <SearchSummary filters={filters} language={language} />
        <EmptySearchResults copy={copy.empty} filters={filters} language={language} />
      </div>
    );
  }

  return (
    <div className={styles.shell} data-search-page="results">
      <div className={styles.intro}>
        <p className={styles.eyebrow}>{copy.results.eyebrow}</p>
        <h1>{copy.results.title(search.data.length)}</h1>
        <p>{copy.results.description}</p>
      </div>
      <SearchSummary filters={filters} language={language} />
      <div className={styles.resultsLayout}>
        <div className={styles.cards}>
          {search.data.map((trip) => (
            <TravelerResultCard
              key={trip.id}
              copy={copy.results}
              filters={filters}
              language={language}
              trip={trip}
            />
          ))}
        </div>
        <aside className={styles.trustAside}>
          <span className={styles.trustIcon} aria-hidden="true">
            <ShieldCheck size={22} />
          </span>
          <h2>{copy.results.trustTitle}</h2>
          <ul>
            {copy.results.trustItems.map((item) => (
              <li key={item}>
                <CheckCircle2 size={15} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
          <p className={styles.trustNote}>{copy.results.trustNote}</p>
        </aside>
      </div>
    </div>
  );
}
