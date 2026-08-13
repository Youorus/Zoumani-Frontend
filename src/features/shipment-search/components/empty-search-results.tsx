"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  BellRing,
  Check,
  CheckCircle2,
  LoaderCircle,
  LockKeyhole,
  UserRoundPlus,
} from "lucide-react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { buildSignupHref } from "@/features/account/lib/build-signup-href";
import type { HomeLanguage } from "@/features/home/components/home-content";

import type { ShipmentSearchContent } from "../content/search-content";
import { useAvailabilityAlert } from "../hooks/use-availability-alert";
import {
  availabilityAlertSchema,
  type AvailabilityAlertInput,
} from "../schemas/availability-alert.schema";
import type { TripSearchFilters } from "../schemas/trip-search.schema";
import styles from "./shipment-search.module.css";

export function EmptySearchResults({
  copy,
  filters,
  language,
}: {
  copy: ShipmentSearchContent["empty"];
  filters: TripSearchFilters;
  language: HomeLanguage;
}) {
  const alert = useAvailabilityAlert();
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<AvailabilityAlertInput>({
    resolver: zodResolver(availabilityAlertSchema),
    defaultValues: { consent: false, email: "", phone: "" },
  });

  const signupHref = buildSignupHref("sender", language, {
    intent: "shipment",
    from: filters.from,
    to: filters.to,
    weight: String(filters.weight),
  });

  return (
    <div className={styles.emptyGrid} data-search-empty="">
      {alert.isSuccess ? (
        <section className={styles.successCard} aria-live="polite">
          <span className={styles.successIcon} aria-hidden="true">
            <CheckCircle2 size={24} />
          </span>
          <h2>{copy.successTitle}</h2>
          <p className={styles.cardDescription}>{copy.successDescription}</p>
        </section>
      ) : (
        <section className={styles.alertCard}>
          <p className={styles.eyebrow}>{copy.alertEyebrow}</p>
          <h2>{copy.alertTitle}</h2>
          <p className={styles.cardDescription}>{copy.alertDescription}</p>

          <form
            className={styles.formGrid}
            onSubmit={handleSubmit((values) =>
              alert.mutate({ ...values, search: filters }),
            )}
            noValidate
          >
            <div className={styles.field}>
              <label htmlFor="alert-email">{copy.emailLabel}</label>
              <Input
                id="alert-email"
                type="email"
                autoComplete="email"
                placeholder={copy.emailPlaceholder}
                aria-invalid={Boolean(errors.email)}
                {...register("email")}
              />
              {errors.email ? (
                <p className={styles.fieldError}>{errors.email.message}</p>
              ) : null}
            </div>
            <div className={styles.field}>
              <label htmlFor="alert-phone">{copy.phoneLabel}</label>
              <Input
                id="alert-phone"
                type="tel"
                autoComplete="tel"
                placeholder={copy.phonePlaceholder}
                aria-invalid={Boolean(errors.phone)}
                {...register("phone")}
              />
              {errors.phone ? (
                <p className={styles.fieldError}>{errors.phone.message}</p>
              ) : null}
            </div>
            <div className={styles.consent}>
              <Controller
                control={control}
                name="consent"
                render={({ field }) => (
                  <Checkbox
                    id="alert-consent"
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                    aria-invalid={Boolean(errors.consent)}
                  />
                )}
              />
              <div>
                <label htmlFor="alert-consent">{copy.consentLabel}</label>
                {errors.consent ? (
                  <p className={styles.fieldError}>{errors.consent.message}</p>
                ) : null}
              </div>
            </div>
            <button
              className={`${styles.alertSubmit} focus-ring`}
              type="submit"
              disabled={alert.isPending}
            >
              {alert.isPending ? (
                <LoaderCircle className="animate-spin" size={16} />
              ) : (
                <BellRing size={16} />
              )}
              {alert.isPending ? copy.submittingLabel : copy.submitLabel}
            </button>
          </form>
          <p className={styles.privacy}>
            <LockKeyhole size={11} aria-hidden="true" /> {copy.privacyNote}
          </p>
        </section>
      )}

      <aside className={styles.accountCard}>
        <UserRoundPlus size={28} aria-hidden="true" />
        <p className={styles.eyebrow}>{copy.accountEyebrow}</p>
        <h2>{copy.accountTitle}</h2>
        <p className={styles.cardDescription}>{copy.accountDescription}</p>
        <ul className={styles.accountBenefits}>
          {copy.accountBenefits.map((benefit) => (
            <li key={benefit}>
              <Check size={14} aria-hidden="true" />
              {benefit}
            </li>
          ))}
        </ul>
        <Link className={`${styles.accountLink} focus-ring`} href={signupHref}>
          {copy.accountCta}
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </aside>
    </div>
  );
}
