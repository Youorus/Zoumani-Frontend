"use client";

import type { ProofKind } from "../types/trip.types";
import type { ParcelCategory } from "../types/travel.types";
import { AttestationField } from "./attestation-field";
import type { FlightChoice } from "./flight-step";
import { ProofPicker } from "./proof-picker";

interface StepReviewProps {
  flights: FlightChoice[];
  weightKg: string;
  categories: ParcelCategory[];
  prices: Record<string, string>;
  proof: { kind: ProofKind; file: File | null };
  onProofChange: (proof: { kind: ProofKind; file: File | null }) => void;
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
  flights,
  weightKg,
  categories,
  prices,
  proof,
  onProofChange,
  attestation,
  onAttestationChange,
  error,
}: StepReviewProps) {
  const engageantes = categories.filter((c) => c.requiresTravelerConsent);
  const origin = flights[0].origin;
  const destination = flights.at(-1)?.destination ?? flights[0].destination;

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

        <dl className="mt-3 space-y-2 border-t border-border pt-3 text-sm">
          {flights.map((flight, index) => (
            <div
              key={`${flight.airlineCode}-${flight.flightNumber}-${index}`}
              className="flex items-start justify-between gap-4"
            >
              <dt className="text-muted-foreground">
                {flight.origin.iata} → {flight.destination.iata}
              </dt>
              <dd className="text-right font-medium">
                <span className="block">
                  {flight.lookup.schedule?.flightDesignator ??
                    `${flight.airlineCode}${flight.flightNumber}`}
                </span>
                {flight.lookup.schedule && (
                  <span className="block text-xs font-normal text-muted-foreground">
                    {formatUtc(flight.lookup.schedule.departureAt)}
                  </span>
                )}
              </dd>
            </div>
          ))}
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Place proposée</dt>
            <dd className="font-medium">{weightKg} kg</dd>
          </div>
        </dl>

        {flights.some((flight) => flight.lookup.outcome === "unavailable") && (
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

      <section className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="border-b border-border bg-inverse-surface px-4 py-4 text-inverse-foreground">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Passeport de confiance
          </p>
          <h2 className="mt-1 text-lg font-semibold">Prouvez ce voyage une seule fois</h2>
          <p className="mt-1 text-sm leading-relaxed text-inverse-muted-foreground">
            Votre document reste privé. Il permet à Zoumani de confirmer votre présence
            sur le vol avant qu&apos;une famille vous confie son colis.
          </p>
        </div>
        <div className="p-4">
          <ProofPicker
            kind={proof.kind}
            file={proof.file}
            onKindChange={(kind) => onProofChange({ ...proof, kind })}
            onFileChange={(file) => onProofChange({ ...proof, file })}
          />
        </div>
      </section>

      <AttestationField accepted={attestation.accepted} onChange={onAttestationChange} />

      {error && (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      )}
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
