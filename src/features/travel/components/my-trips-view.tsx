"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, CheckCircle2, Clock3, PlaneTakeoff, Plus, Sparkles } from "lucide-react";
import { useState } from "react";

import { cancelTrip, deleteTrip } from "../api/travel-client";
import type { Trip, TripStatus } from "../types/trip.types";
import { TripRoute } from "./trip-route";

interface MyTripsViewProps {
  trips: Trip[];
  createdTripId?: string;
  cancellationPenalty: number | null;
}

/**
 * Les voyages du voyageur, et ce qu'il peut en faire.
 *
 * ═══ Quatre situations, pas neuf statuts ═══
 *
 * La machine à états en compte neuf ; le voyageur n'a qu'une question :
 * « qu'est-ce que je dois faire ? ». « Vérification automatique » et
 * « examen manuel » demandent la même chose — attendre — et les
 * distinguer à l'écran ne lui apprendrait qu'un détail de notre
 * organisation.
 *
 * ═══ Supprimer et annuler ne sont pas la même chose ═══
 *
 * Un brouillon se supprime : rien n'existe encore. Un voyage transmis
 * s'annule, et l'annulation **laisse une trace** — c'est ce qui permet
 * plus tard d'expliquer une perte de points, là où une suppression ne
 * laisserait rien à montrer.
 *
 * Le mot employé suit cette différence. Proposer « supprimer » sur un
 * voyage vérifié laisserait croire qu'il n'en restera rien.
 */
export function MyTripsView({
  trips,
  createdTripId,
  cancellationPenalty,
}: MyTripsViewProps) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  async function agir(trip: Trip) {
    setBusy(trip.id);
    setFailure(null);
    try {
      if (trip.stage === "brouillon") {
        await deleteTrip(trip.id);
      } else {
        await cancelTrip(trip.id);
      }
      setConfirming(null);
      router.refresh();
    } catch (error) {
      setFailure(error instanceof Error ? error.message : "L'opération n'a pas abouti.");
    } finally {
      setBusy(null);
    }
  }

  if (trips.length === 0) {
    return <AucunVoyage />;
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 sm:px-8">
      <header className="overflow-hidden rounded-[1.75rem] bg-inverse-surface px-5 py-6 text-inverse-foreground sm:flex sm:items-end sm:justify-between sm:gap-8 sm:px-8 sm:py-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Espace voyageur
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Vos voyages font voyager plus que vous.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-inverse-muted-foreground sm:text-base">
            Chaque kilo partagé rapproche une famille, rémunère votre trajet et construit
            votre réputation dans la communauté Zoumani.
          </p>
        </div>
        <Link
          href="/trips/nouveau"
          className="focus-ring mt-5 inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground sm:mt-0"
        >
          <Plus className="size-4" aria-hidden />
          Nouveau voyage
        </Link>
      </header>

      {createdTripId && (
        <div className="flex items-start gap-3 rounded-2xl border border-success/30 bg-success/10 p-4" role="status">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
          <div>
            <p className="font-bold">Votre voyage est entre de bonnes mains.</p>
            <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
              Le billet et l&apos;offre ont bien été transmis. Notre équipe les vérifie
              avant de rendre vos kilos visibles aux expéditeurs.
            </p>
          </div>
        </div>
      )}

      {failure && (
        <p
          className="rounded-xl border border-error/40 bg-error/10 p-3 text-sm"
          role="alert"
        >
          {failure}
        </p>
      )}

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
            Carnet de route
          </p>
          <h2 className="mt-1 text-2xl font-semibold">{trips.length} voyage{trips.length > 1 ? "s" : ""}</h2>
        </div>
        <Link href="/compte/points" className="focus-ring rounded-lg text-sm font-bold text-primary">
          Voir mes points
        </Link>
      </div>

      <ul className="grid gap-4 lg:grid-cols-2">
        {trips.map((trip) => (
          <li
            key={trip.id}
            className={`overflow-hidden rounded-[1.5rem] border bg-surface shadow-[0_20px_60px_-44px_rgb(43_29_23_/_0.65)] ${
              createdTripId === trip.id ? "border-primary/60 ring-2 ring-primary/10" : "border-border"
            }`}
          >
            <div className="flex items-center justify-between gap-4 border-b border-border bg-muted/35 px-5 py-3">
              <Badge status={trip.status} />
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Clock3 className="size-3.5" aria-hidden />
                {formatUtc(trip.departureAt)}
              </span>
            </div>

            <div className="p-5">
              <TripRoute
                origin={{ code: trip.originAirportCode }}
                destination={{ code: trip.destinationAirportCode }}
              />

              <div className="mt-5 flex items-center gap-3 rounded-xl bg-background p-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <PlaneTakeoff className="size-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold">
                    {trip.segments.length > 1
                      ? `${trip.segments.length} vols avec correspondance`
                      : "Vol direct"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {trip.segments.map((segment) => `${segment.airlineCode}${segment.flightNumber}`).join(" · ")}
                  </p>
                </div>
              </div>

              {trip.correctionNote && (
                <p className="mt-3 rounded-xl border border-warning/30 bg-warning/10 px-3 py-2.5 text-sm">
                  <strong className="block">Une précision est nécessaire</strong>
                  {trip.correctionNote}
                </p>
              )}
              {trip.rejectionReason && (
                <p className="mt-3 rounded-xl border border-error/25 bg-error/10 px-3 py-2.5 text-sm">
                  {trip.rejectionReason}
                </p>
              )}

            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
              <Link
                href={`/trips/${trip.id}`}
                className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-bold text-primary-foreground"
              >
                Voir le détail
                <ArrowUpRight className="size-3.5" aria-hidden />
              </Link>

              {/* Proposé seulement quand le serveur dit que c'est
                  possible : offrir un lien qui mène à un refus fait
                  perdre confiance dans tous les autres. */}
              {trip.isEditable && (
                <Link
                  href={`/trips/${trip.id}/modifier`}
                  className="focus-ring rounded-lg border border-border px-3 py-2 text-sm font-medium"
                >
                  Modifier
                </Link>
              )}

              {trip.stage !== "clos" &&
                (confirming === trip.id ? (
                  <>
                    <button
                      type="button"
                      onClick={() => void agir(trip)}
                      disabled={busy === trip.id}
                      className="rounded-lg bg-error px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
                    >
                      {busy === trip.id
                        ? "…"
                        : trip.stage === "brouillon"
                          ? "Confirmer la suppression"
                          : "Confirmer l'annulation"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirming(null)}
                      className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground"
                    >
                      Revenir
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirming(trip.id)}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground"
                  >
                    {trip.stage === "brouillon" ? "Supprimer" : "Annuler ce voyage"}
                  </button>
                ))}
            </div>

            {/* L'avertissement n'apparaît qu'au moment de confirmer, et
                seulement quand il s'applique : annoncer une perte de
                points sur un brouillon ferait hésiter sans raison. */}
            {confirming === trip.id && trip.stage !== "brouillon" && (
              <p className="mt-2.5 text-xs text-muted-foreground">
                Des expéditeurs peuvent compter sur ce voyage. Une annulation après
                vérification peut retirer des points de votre programme de fidélité
                {cancellationPenalty !== null ? (
                  <>
                    {" "}: <span className="font-medium">{cancellationPenalty} points</span>
                  </>
                ) : null}
                .
              </p>
            )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const BADGES: Record<TripStatus, { label: string; className: string }> = {
  draft: { label: "Brouillon", className: "bg-muted text-muted-foreground" },
  pending_automatic_verification: { label: "Contrôle en cours", className: "bg-primary/10 text-primary" },
  pending_manual_review: { label: "Examen en cours", className: "bg-primary/10 text-primary" },
  action_required: { label: "Action demandée", className: "bg-warning/15 text-warning" },
  verified: { label: "Voyage validé", className: "bg-success/15 text-success" },
  rejected: { label: "Non validé", className: "bg-error/10 text-error" },
  cancelled: { label: "Annulé", className: "bg-muted text-muted-foreground" },
  expired: { label: "Expiré", className: "bg-muted text-muted-foreground" },
  completed: { label: "Voyage accompli", className: "bg-success/15 text-success" },
};

function Badge({ status }: { status: TripStatus }) {
  const badge = BADGES[status];
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${badge.className}`}
    >
      {badge.label}
    </span>
  );
}

function AucunVoyage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-8">
      <div className="relative overflow-hidden rounded-[2rem] bg-inverse-surface px-6 py-12 text-center text-inverse-foreground sm:px-12">
        <div className="absolute -right-16 -top-16 size-56 rounded-full bg-primary/20 blur-3xl" aria-hidden />
        <Sparkles className="relative mx-auto size-8 text-primary" aria-hidden />
        <p className="relative mt-4 text-xs font-bold uppercase tracking-[0.2em] text-primary">Votre prochain chapitre</p>
        <h1 className="relative mt-2 text-3xl font-semibold">Votre carnet de route vous attend.</h1>
      <p className="relative mx-auto mt-3 max-w-xl text-sm leading-relaxed text-inverse-muted-foreground">
        Vous prenez bientôt l&apos;avion ? Proposez la place libre de vos bagages : vous
        rendez service, vous gagnez des points, et vous financez une partie de votre
        voyage.
      </p>
      <Link
        href="/trips/nouveau"
        className="focus-ring relative mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground"
      >
        <Plus className="size-4" aria-hidden />
        Proposer mon premier voyage
      </Link>
      </div>
    </div>
  );
}

/** Affiche un instant UTC sans le convertir : c'est l'heure officielle. */
function formatUtc(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(iso));
}
