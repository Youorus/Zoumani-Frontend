import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  Gauge,
  PackageCheck,
  Plane,
  ShieldCheck,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { buildSignupHref } from "@/features/account/lib/build-signup-href";
import type { HomeLanguage } from "@/features/home/components/home-content";

import type { ShipmentSearchContent } from "../content/search-content";
import { getSearchCity } from "../data/search-cities";
import type { TripSearchFilters } from "../schemas/trip-search.schema";
import type { SearchTrip } from "../types/search-trip.types";
import styles from "./shipment-search.module.css";

function formatDate(value: string, language: HomeLanguage) {
  return new Intl.DateTimeFormat(language === "fr" ? "fr-FR" : "en-GB", {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

function formatPrice(trip: SearchTrip, language: HomeLanguage) {
  return new Intl.NumberFormat(language === "fr" ? "fr-FR" : "en-GB", {
    style: "currency",
    currency: trip.currency,
    maximumFractionDigits: 0,
  }).format(trip.pricePerKgCents / 100);
}

export function TravelerResultCard({
  copy,
  filters,
  language,
  trip,
}: {
  copy: ShipmentSearchContent["results"];
  filters: TripSearchFilters;
  language: HomeLanguage;
  trip: SearchTrip;
}) {
  const origin = getSearchCity(trip.origin);
  const destination = getSearchCity(trip.destination);
  const signupHref = buildSignupHref("sender", language, {
    intent: "shipment",
    from: filters.from,
    to: filters.to,
    weight: String(filters.weight),
    trip: trip.id,
  });

  return (
    <article className={styles.card} data-search-result="">
      <div className={styles.cardTop}>
        <div className={styles.traveler}>
          <div className={styles.avatar}>
            <Image src={trip.traveler.avatarUrl} alt="" fill sizes="56px" />
          </div>
          <div>
            <h2>{trip.traveler.name}</h2>
            <p className={styles.travelerMeta}>
              <span className={styles.rating}>
                <Star size={12} fill="currentColor" aria-hidden="true" /> {trip.traveler.rating}
              </span>
              <span>{trip.traveler.reviewCount} {copy.reviews}</span>
              {trip.traveler.verified ? (
                <span><BadgeCheck size={12} aria-hidden="true" /> {copy.verified}</span>
              ) : null}
              <span>{trip.traveler.completedTrips} {copy.trips}</span>
              <span>{trip.traveler.points.toLocaleString(language === "fr" ? "fr-FR" : "en-GB")} {copy.points}</span>
              <span>{trip.traveler.responseTime[language]}</span>
            </p>
          </div>
        </div>
        <span className={styles.status}>
          <Check size={12} aria-hidden="true" />
          {trip.statusLabel[language]}
        </span>
      </div>

      <div className={styles.tripRoute}>
        <div>
          <strong>{origin?.city ?? trip.origin}</strong>
          <small>{formatDate(trip.departureAt, language)} · {origin?.airport}</small>
        </div>
        <span className={styles.routeRail} aria-hidden="true">
          <Plane size={17} />
        </span>
        <div className={styles.destination}>
          <strong>{destination?.city ?? trip.destination}</strong>
          <small>{formatDate(trip.arrivalAt, language)} · {destination?.airport}</small>
        </div>
      </div>

      <div className={styles.metrics}>
        <div className={styles.metric}>
          <small><Gauge size={12} aria-hidden="true" /> {copy.capacity}</small>
          <strong>{trip.availableCapacityKg} kg</strong>
        </div>
        <div className={styles.metric}>
          <small><CalendarDays size={12} aria-hidden="true" /> {language === "fr" ? "Remise" : "Handover"}</small>
          <strong>{trip.handoverLabel[language]}</strong>
        </div>
        <div className={styles.metric}>
          <small><PackageCheck size={12} aria-hidden="true" /> {copy.perKg}</small>
          <strong>{formatPrice(trip, language)} / kg</strong>
        </div>
      </div>

      <div className={styles.cardFooter}>
        <p className={styles.protection}>
          <ShieldCheck size={16} aria-hidden="true" />
          {copy.protection}
        </p>
        <Link className={`${styles.chooseLink} focus-ring`} href={signupHref}>
          {copy.chooseLabel}
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
