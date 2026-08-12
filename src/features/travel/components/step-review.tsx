"use client";

import type { Airport, FlightLookup, ParcelCategory } from "../types/travel.types";
import { AttestationField } from "./attestation-field";

interface StepReviewProps {
  origin: Airport;
  destination: Airport;
  airlineCode: string;
  flightNumber: string;
  lookup: FlightLookup;
  weightKg: string;
  categories: ParcelCategory[];
  prices: Record<string, string>;
  attestation: { accepted: boolean; version: string };
  onAttestationChange: (accepted: boolean, version: string) => void;
  error?: string;
}

/**
 * Ce qui va être publié, et l'engagement qui l'accompagne.
 *
 * ═══ Pourquoi l'engagement est ici, et nulle part ailleurs ═══
 *
 * Signer avant d'avoir vu ce qu'on signe ne vaut rien. Dans la version
 * précédente, la case vivait au milieu du formulaire de tarification :
 * on la cochait sans savoir ce que serait l'annonce finale.
 *
 * Elle est donc à la dernière étape, **sous** le récapitulatif complet.
 * La personne lit son vol, ses kilos, ses tarifs, puis certifie. C'est
 * ce qui rend l'engagement opposable : elle a vu exactement ce qu'elle
 * affirmait.
 *
 * Les conditions particulières des catégories qui engagent — ordonnance,
 * déclaration de valeur — reviennent ici pour la même raison. Elles
 * n'avaient pas leur place dans une grille de sélection, où elles
 * allongeaient la page sans être lues.
 */
export function StepReview({
  origin,
  destination,
  airlineCode,
  flightNumber,
  lookup,
  weightKg,
  categories,
  prices,
  attestation,
  onAttestationChange,
  error,
}: StepReviewProps) {
  const engageantes = categories.filter((c) => c.requiresTravelerConsent);

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-border p-4">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold">{origin.iata}</span>
          <span aria-hidden className="flex-1 border-t border-dashed border-border" />
          <span className="text-lg font-semibold">{destination.iata}</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {origin.city} → {destination.city}
        </p>

        <dl className="mt-3 space-y-1.5 border-t border-border pt-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Vol</dt>
            <dd className="font-medium">
              {lookup.schedule?.flightDesignator ?? `${airlineCode}${flightNumber}`}
            </dd>
          </div>
          {lookup.schedule && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Départ</dt>
              <dd className="font-medium">{formatUtc(lookup.schedule.departureAt)}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Place proposée</dt>
            <dd className="font-medium">{weightKg} kg</dd>
          </div>
        </dl>

        {lookup.outcome === "unavailable" && (
          <p className="mt-3 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-muted-foreground">
            Nous n&apos;avons pas pu confirmer ce vol automatiquement. Votre voyage sera
            examiné par notre équipe — ce n&apos;est pas un refus.
          </p>
        )}
      </section>

      <section className="rounded-xl border border-border p-4">
        <h2 className="text-sm font-medium">Vos tarifs</h2>
        <ul className="mt-2.5 space-y-2 text-sm">
          {categories.map((category) => (
            <li key={category.code} className="flex justify-between gap-4">
              <span className="text-muted-foreground">{category.label}</span>
              <span className="shrink-0 font-medium">
                {prices[category.code]} €{" "}
                <span className="font-normal text-muted-foreground">
                  {category.unit === "piece" ? "/ pièce" : "/ kg"}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {engageantes.length > 0 && (
        <section className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4">
          <h2 className="text-sm font-medium">Conditions à respecter</h2>
          <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
            {engageantes.map((category) => (
              <li key={category.code}>
                <span className="font-medium text-foreground">{category.label}</span> —{" "}
                {category.restrictions.map(libelleRestriction).join(", ")}
              </li>
            ))}
          </ul>
        </section>
      )}

      <AttestationField accepted={attestation.accepted} onChange={onAttestationChange} />

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

/** Traduit un code de restriction. Le serveur rend le code, pas la phrase. */
function libelleRestriction(code: string): string {
  const libelles: Record<string, string> = {
    value_declaration: "valeur à déclarer",
    sealed_packaging: "emballage scellé",
    prescription: "ordonnance exigée",
    open_inspection: "colis ouvert à l'inspection",
    cabin_only: "cabine uniquement",
  };
  return libelles[code] ?? code;
}

/** Affiche un instant UTC sans le convertir : c'est l'heure officielle. */
function formatUtc(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(iso));
}
