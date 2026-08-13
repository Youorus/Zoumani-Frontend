"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { cancelTrip, deleteTrip } from "../api/travel-client";
import type { Trip, TripStage } from "../types/trip.types";

interface MyTripsViewProps {
  trips: Trip[];
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
export function MyTripsView({ trips }: MyTripsViewProps) {
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
    <div className="mx-auto w-full max-w-2xl space-y-4 p-4 sm:p-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Mes trajets</h1>
        <Link
          href="/trips/nouveau"
          className="shrink-0 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Proposer un voyage
        </Link>
      </header>

      {failure && (
        <p
          className="rounded-xl border border-error/40 bg-error/10 p-3 text-sm"
          role="alert"
        >
          {failure}
        </p>
      )}

      <ul className="space-y-3">
        {trips.map((trip) => (
          <li key={trip.id} className="rounded-2xl border border-border p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-medium">
                  <span>{trip.originAirportCode}</span>
                  <span aria-hidden className="text-muted-foreground">
                    →
                  </span>
                  <span>{trip.destinationAirportCode}</span>
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {formatUtc(trip.departureAt)}
                  {trip.segments[0] && (
                    <>
                      {" · "}
                      {trip.segments[0].airlineCode}
                      {trip.segments[0].flightNumber}
                    </>
                  )}
                </p>
              </div>
              <Badge stage={trip.stage} />
            </div>

            {trip.correctionNote && (
              <p className="mt-3 rounded-lg bg-amber-500/10 px-3 py-2 text-sm">
                {trip.correctionNote}
              </p>
            )}
            {trip.rejectionReason && (
              <p className="mt-3 rounded-lg bg-error/10 px-3 py-2 text-sm">
                {trip.rejectionReason}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
              <Link
                href={`/trips/${trip.id}`}
                className="rounded-lg border border-border px-3 py-1.5 text-sm"
              >
                Voir le détail
              </Link>

              {/* Proposé seulement quand le serveur dit que c'est
                  possible : offrir un lien qui mène à un refus fait
                  perdre confiance dans tous les autres. */}
              {trip.isEditable && (
                <Link
                  href={`/trips/${trip.id}/modifier`}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm"
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
                vérification retire <span className="font-medium">250 points</span> de
                votre programme de fidélité.
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

const BADGES: Record<TripStage, { libelle: string; classe: string }> = {
  brouillon: { libelle: "Brouillon", classe: "bg-muted text-muted-foreground" },
  en_attente: { libelle: "En vérification", classe: "bg-primary/10 text-primary" },
  a_corriger: {
    libelle: "À corriger",
    classe: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  },
  clos: { libelle: "Terminé", classe: "bg-muted text-muted-foreground" },
};

function Badge({ stage }: { stage: TripStage }) {
  const badge = BADGES[stage];
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${badge.classe}`}
    >
      {badge.libelle}
    </span>
  );
}

function AucunVoyage() {
  return (
    <div className="mx-auto w-full max-w-lg space-y-4 p-6 text-center">
      <h1 className="text-xl font-semibold">Aucun trajet pour l&apos;instant</h1>
      <p className="text-sm text-muted-foreground">
        Vous prenez bientôt l&apos;avion ? Proposez la place libre de vos bagages : vous
        rendez service, vous gagnez des points, et vous financez une partie de votre
        voyage.
      </p>
      <Link
        href="/trips/nouveau"
        className="inline-block rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground"
      >
        Proposer mon premier voyage
      </Link>
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
