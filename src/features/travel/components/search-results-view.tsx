"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  PackageCheck,
  SearchX,
  ShieldCheck,
  SlidersHorizontal,
  UserRoundPlus,
} from "lucide-react";

import { buildSignupHref } from "@/features/account/lib/build-signup-href";
import type { CapacityMatch } from "../types/trip.types";
import { AvailabilityAlertCard } from "./availability-alert-card";
import { TravelerCard } from "./traveler-card";

interface SearchResultsViewProps {
  matches: CapacityMatch[];
  criteria: { origin: string; destination: string; categories: string[] };
  /** Libellés des catégories, résolus côté serveur. */
  labels: Record<string, string>;
  connected: boolean;
}

/**
 * Les voyageurs qui desservent le trajet demandé.
 *
 * Le compte est annoncé en tête : savoir qu'il y a « 3 voyageurs »
 * avant de faire défiler change la façon dont on lit la liste. Et quand
 * il n'y en a aucun, l'écran propose quelque chose plutôt que de
 * constater un vide.
 */
export function SearchResultsView({ matches, criteria, labels, connected }: SearchResultsViewProps) {
  const hasRoute = Boolean(criteria.origin && criteria.destination);
  const trajet =
    matches[0] !== undefined
      ? `${matches[0].originCity} → ${matches[0].destinationCity}`
      : `${criteria.origin} → ${criteria.destination}`;

  return (
    <div
      className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6"
    >
      {!hasRoute ? (
        <SearchInvitation />
      ) : (
        <>
          <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                {matches.length === 0 ? "Recherche gardée ouverte" : "Places réellement disponibles"}
              </p>
              <h1 className="mt-2 font-display text-3xl text-foreground sm:text-4xl">
                {matches.length === 0
                  ? "Aucun voyageur pour l'instant"
                  : `${matches.length} voyageur${matches.length > 1 ? "s" : ""} vers ${matches[0].destinationCity}`}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {matches.length === 0
                  ? `Sur ${trajet}`
                  : "Comparez la place, la remise et les tarifs avant de choisir."}
              </p>
            </div>
            {matches.length > 0 && (
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-muted-foreground">
                <SlidersHorizontal className="size-3.5 text-primary" aria-hidden />
                Les plus proches apparaissent d&apos;abord
              </span>
            )}
          </header>

          {matches.length === 0 ? (
            <AucunResultat criteria={criteria} connected={connected} />
          ) : (
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
              <ul className="space-y-5">
                {matches.map((match) => (
                  <li key={match.capacityId}>
                    <TravelerCard match={match} labels={labels} />
                  </li>
                ))}
              </ul>

              <aside className="rounded-[1.5rem] border border-border bg-surface p-5 lg:sticky lg:top-48">
                <span className="grid size-11 place-items-center rounded-xl bg-inverse-surface text-primary">
                  <ShieldCheck className="size-5" aria-hidden />
                </span>
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.15em] text-primary">
                  Choisir sans deviner
                </p>
                <h2 className="mt-2 text-xl font-semibold">Chaque carte dit l&apos;essentiel.</h2>
                <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
                  {[
                    "Le voyage est contrôlé avant publication",
                    "Les kilos encore libres sont actualisés",
                    "Chaque catégorie porte son vrai tarif",
                    "La possibilité d’un relais est annoncée",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                        <Check className="size-3" aria-hidden />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="mt-5 flex items-start gap-2 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
                  <PackageCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  Les coordonnées personnelles restent masquées jusqu&apos;au parcours sécurisé.
                </p>
              </aside>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SearchInvitation() {
  return (
    <section className="mx-auto max-w-3xl rounded-[1.75rem] border border-dashed border-primary/30 bg-primary/5 px-6 py-12 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-inverse-surface text-primary">
        <SearchX className="size-5" aria-hidden />
      </span>
      <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-primary">
        Votre route d&apos;abord
      </p>
      <h1 className="mt-2 text-3xl font-semibold">
        D&apos;où part le colis, et où doit-il retrouver les siens ?
      </h1>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
        Choisissez les deux villes dans la barre ci-dessus. Nous afficherons uniquement
        les places réellement publiées par des voyageurs vérifiés.
      </p>
    </section>
  );
}

function AucunResultat({
  criteria,
  connected,
}: {
  criteria: SearchResultsViewProps["criteria"];
  connected: boolean;
}) {
  const signupHref = buildSignupHref("sender", "fr", {
    intent: "shipment",
    from: criteria.origin,
    to: criteria.destination,
  });

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[2rem] bg-inverse-surface px-6 py-8 text-inverse-foreground sm:px-9 sm:py-10">
        <div className="pointer-events-none absolute -right-14 -top-20 size-64 rounded-full border-[3rem] border-primary/15" />
        <div className="relative max-w-2xl">
          <span className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground">
            <SearchX className="size-5" aria-hidden />
          </span>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            La route est calme, pas fermée
          </p>
          <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">
            Le bon voyageur n&apos;a pas encore annoncé sa place.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-inverse-muted-foreground sm:text-base">
            Les départs se publient au fil des billets confirmés. Gardez ce trajet vivant :
            nous vous préviendrons dès qu&apos;une place vérifiée pourra porter votre colis.
          </p>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <AvailabilityAlertCard
          origin={criteria.origin}
          destination={criteria.destination}
          categories={criteria.categories}
        />

        <aside className="flex flex-col rounded-[1.75rem] bg-primary p-6 text-primary-foreground sm:p-8">
          <UserRoundPlus className="size-7" aria-hidden />
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] opacity-75">
            {connected ? "Votre espace" : "Pour aller plus loin"}
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            {connected ? "Retrouvez tout au même endroit." : "Préparez l’envoi sans repartir de zéro."}
          </h2>
          <p className="mt-3 text-sm leading-relaxed opacity-85">
            {connected
              ? "Vos alertes et vos futurs colis restent liés à une seule histoire, facile à suivre."
              : "Un compte mémorise vos recherches, sécurise votre identité et rassemble le suivi de toute la famille."}
          </p>
          <ul className="mt-5 space-y-3 text-sm">
            {["Recherche mémorisée", "Suivi du colis", "Échanges protégés"].map((benefit) => (
              <li key={benefit} className="flex items-center gap-2">
                <span className="grid size-5 place-items-center rounded-full bg-primary-foreground/15">
                  <Check className="size-3" aria-hidden />
                </span>
                {benefit}
              </li>
            ))}
          </ul>
          <Link
            href={connected ? "/compte/envois" : signupHref}
            className="focus-ring mt-auto inline-flex items-center justify-between rounded-xl bg-primary-foreground px-4 py-3.5 text-sm font-bold text-primary"
          >
            {connected ? "Voir mes envois" : "Créer mon espace expéditeur"}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link
            href="/trips/nouveau"
            className="focus-ring mt-3 text-center text-xs font-semibold underline decoration-primary-foreground/40 underline-offset-4"
          >
            Vous voyagez bientôt ? Proposez votre place
          </Link>
        </aside>
      </div>
    </div>
  );
}
