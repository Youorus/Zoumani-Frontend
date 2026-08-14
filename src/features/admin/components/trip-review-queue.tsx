"use client";

import {
  AlertCircle,
  ArrowRight,
  Check,
  ExternalLink,
  FileCheck2,
  FileSearch,
  LoaderCircle,
  MailCheck,
  PlaneTakeoff,
  RefreshCw,
  Route,
  ShieldCheck,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PROOF_KINDS } from "@/features/travel/components/proof-picker";
import type { ProofKind, TripStatus } from "@/features/travel/types/trip.types";
import { AuthError } from "@/lib/auth/auth-client";

import {
  acceptTripProof,
  getAdminTrip,
  getTripProofUrl,
  listAdminTrips,
  rejectAdminTrip,
  rejectTripProof,
  requestTripCorrection,
  takeTripForReview,
  verifyAdminTrip,
  type AdminTrip,
  type AdminTripProof,
  type TripVerificationMethod,
} from "../api/admin-trip-client";
import { AdminNav } from "./admin-nav";
import styles from "./review-queue.module.css";

const FILTERS: { value: TripStatus; label: string }[] = [
  { value: "pending_automatic_verification", label: "À prendre" },
  { value: "pending_manual_review", label: "En examen" },
  { value: "action_required", label: "Chez le voyageur" },
  { value: "verified", label: "Validés" },
  { value: "rejected", label: "Refusés" },
];

const STATUS_LABELS: Record<TripStatus, string> = {
  draft: "Brouillon",
  pending_automatic_verification: "À prendre en charge",
  pending_manual_review: "Examen en cours",
  action_required: "Correction attendue",
  verified: "Voyage vérifié",
  rejected: "Voyage refusé",
  cancelled: "Voyage annulé",
  expired: "Voyage expiré",
  completed: "Voyage accompli",
};

const METHODS: Record<TripVerificationMethod, { label: string; help: string }> = {
  booking_api: {
    label: "Réservation confirmée par la compagnie",
    help: "La source compagnie ou GDS suffit comme preuve primaire.",
  },
  flight_api_and_document: {
    label: "Vol confirmé + document recoupé",
    help: "Le vol existe et une pièce actuelle a été acceptée.",
  },
  e_ticket_document: {
    label: "Billet électronique contrôlé",
    help: "Un billet électronique actuel doit être accepté.",
  },
  boarding_pass: {
    label: "Carte d'embarquement contrôlée",
    help: "Une carte d'embarquement actuelle doit être acceptée.",
  },
  manual_review: {
    label: "Examen humain documenté",
    help: "À réserver aux cas sans source automatique exploitable.",
  },
};

interface OpenedTrip {
  trip: AdminTrip;
  proofs: AdminTripProof[];
}

export function TripReviewQueue() {
  const [filter, setFilter] = useState<TripStatus>("pending_automatic_verification");
  const [queue, setQueue] = useState<AdminTrip[]>([]);
  const [opened, setOpened] = useState<OpenedTrip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setQueue(await listAdminTrips(filter));
    } catch (caught) {
      setError(caught instanceof AuthError ? caught.message : "Chargement impossible.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    let cancelled = false;
    void listAdminTrips(filter)
      .then((trips) => {
        if (!cancelled) {
          setQueue(trips);
          setError(null);
        }
      })
      .catch((caught: unknown) => {
        if (!cancelled) {
          setError(caught instanceof AuthError ? caught.message : "Chargement impossible.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filter]);

  async function open(id: string) {
    setError(null);
    try {
      setOpened(await getAdminTrip(id));
    } catch (caught) {
      setError(caught instanceof AuthError ? caught.message : "Ouverture impossible.");
    }
  }

  async function act(action: () => Promise<void>) {
    setError(null);
    try {
      await action();
      const id = opened?.trip.id;
      await reload();
      if (id) setOpened(await getAdminTrip(id));
    } catch (caught) {
      setError(caught instanceof AuthError ? caught.message : "Action impossible.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1492px] px-4 sm:px-8 lg:px-12">
      <AdminNav current="travel" />
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Tour de contrôle Zoumani</p>
        <h1>Un billet vérifié ouvre la route à des familles.</h1>
        <p>
          Le trajet, la personne et la preuve doivent raconter la même histoire. Ici,
          chaque validation protège le voyageur autant que l&apos;expéditeur qui lui
          confiera un colis.
        </p>
      </header>

      <div className="my-5 flex flex-wrap items-center gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => {
              setLoading(true);
              setFilter(item.value);
            }}
            className={`focus-ring rounded-full border px-4 py-2 text-sm font-bold transition-colors ${
              filter === item.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface hover:bg-muted"
            }`}
          >
            {item.label}
          </button>
        ))}
        <span className="ml-auto text-xs font-semibold text-muted-foreground">
          {queue.length} voyage{queue.length > 1 ? "s" : ""}
        </span>
        <button
          type="button"
          onClick={() => void reload()}
          className="focus-ring grid size-10 place-items-center rounded-full border border-border bg-surface"
          aria-label="Rafraîchir la file"
        >
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden />
        </button>
      </div>

      {error ? (
        <p className="mb-4 flex items-center gap-2 rounded-xl bg-error/10 p-3 text-sm text-error" role="alert">
          <AlertCircle className="size-4 shrink-0" aria-hidden />
          {error}
        </p>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[22rem_1fr]">
        <section className={styles.queue} aria-label="File des voyages">
          {loading ? (
            <p className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" aria-hidden /> Chargement…
            </p>
          ) : queue.length === 0 ? (
            <div className="grid min-h-44 place-items-center p-5 text-center">
              <ShieldCheck className="size-7 text-success" aria-hidden />
              <p className="mt-2 text-sm font-semibold">Cette piste est dégagée.</p>
              <p className="text-xs text-muted-foreground">Aucun voyage à afficher.</p>
            </div>
          ) : (
            <ul className="m-0 list-none space-y-1 p-0">
              {queue.map((trip) => (
                <li key={trip.id}>
                  <button
                    type="button"
                    onClick={() => void open(trip.id)}
                    className={`focus-ring group w-full rounded-2xl border px-3.5 py-3 text-left transition-all ${
                      opened?.trip.id === trip.id
                        ? "border-primary/30 bg-primary/8 shadow-soft"
                        : "border-transparent hover:border-border hover:bg-muted"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                        <PlaneTakeoff className="size-4" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <strong className="block font-display text-lg">
                          {trip.origin_airport_code} → {trip.destination_airport_code}
                        </strong>
                        <span className="block truncate text-xs text-muted-foreground">
                          {formatDateTime(trip.departure_at)}
                        </span>
                      </span>
                      <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {opened ? (
          <TripDossier key={opened.trip.id} detail={opened} onAct={act} />
        ) : (
          <section className={`${styles.detail} grid min-h-96 place-items-center text-center`}>
            <div>
              <Route className="mx-auto size-9 text-primary" aria-hidden />
              <h2 className="mt-3 font-display text-2xl">Ouvrez un voyage</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                L&apos;itinéraire et ses justificatifs apparaîtront ici.
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function TripDossier({
  detail,
  onAct,
}: {
  detail: OpenedTrip;
  onAct: (action: () => Promise<void>) => Promise<void>;
}) {
  const { trip, proofs } = detail;
  const [reason, setReason] = useState("");
  const [method, setMethod] = useState<TripVerificationMethod>("flight_api_and_document");
  const [busy, setBusy] = useState(false);
  const reviewing = trip.status === "pending_manual_review";
  const currentProofs = proofs.filter((proof) => proof.status !== "replaced");
  const canVerify = methodHasEvidence(method, currentProofs);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    try {
      await onAct(action);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={styles.detail}>
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-primary">
            Voyage {trip.id.slice(0, 8)}
          </p>
          <h2 className="mt-1 font-display text-3xl sm:text-4xl">
            {trip.origin_airport_code} → {trip.destination_airport_code}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Départ {formatDateTime(trip.departure_at)} · voyageur {trip.traveler_user_id.slice(0, 8)}
          </p>
        </div>
        <StatusPill status={trip.status} />
      </div>

      <div className="mt-5 grid gap-6 xl:grid-cols-[1fr_19rem]">
        <div className="space-y-6">
          <section>
            <SectionTitle icon={Route} title="Itinéraire déclaré" />
            <ol className="space-y-3">
              {trip.segments.map((segment) => (
                <li key={segment.id} className="rounded-2xl bg-muted/55 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <strong>{segment.origin_airport_code} → {segment.destination_airport_code}</strong>
                    <span className="rounded-full bg-surface px-2.5 py-1 font-mono text-xs font-bold">
                      {segment.flight_designator}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDateTime(segment.departure_at)} → {formatDateTime(segment.arrival_at)}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <SectionTitle icon={FileSearch} title="Justificatifs privés" />
            <div className="grid gap-3 md:grid-cols-2">
              {proofs.map((proof) => (
                <ProofCard
                  key={proof.id}
                  tripId={trip.id}
                  proof={proof}
                  reviewing={reviewing}
                  busy={busy}
                  reason={reason}
                  onAccept={() => run(() => acceptTripProof(trip.id, proof.id))}
                  onReject={() =>
                    run(async () => {
                      await rejectTripProof(trip.id, proof.id, reason);
                      setReason("");
                    })
                  }
                />
              ))}
            </div>
          </section>

          {reviewing ? (
            <section className="rounded-2xl border border-border bg-surface-elevated p-4 sm:p-5">
              <SectionTitle icon={ShieldCheck} title="Décision opérateur" />
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">
                  Message en cas de correction ou de refus
                </span>
                <Textarea
                  rows={3}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Décrivez précisément ce qui ne correspond pas et comment le corriger."
                />
              </label>

              <div className="mt-4">
                <span className="mb-1.5 block text-sm font-semibold">Fondement de la validation</span>
                <Select value={method} onValueChange={(value) => setMethod(value as TripVerificationMethod)}>
                  <SelectTrigger aria-label="Méthode de vérification">
                    <span>{METHODS[method].label}</span>
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(METHODS) as TripVerificationMethod[]).map((value) => (
                      <SelectItem key={value} value={value}>{METHODS[value].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{METHODS[method].help}</p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy || !canVerify}
                  onClick={() => void run(() => verifyAdminTrip(trip.id, method))}
                  title={canVerify ? undefined : "Acceptez d'abord la preuve correspondante"}
                  className="focus-ring inline-flex items-center gap-2 rounded-full bg-success px-5 py-2.5 text-sm font-black text-white disabled:opacity-35"
                >
                  <Check className="size-4" aria-hidden /> Valider le voyage
                </button>
                <button
                  type="button"
                  disabled={busy || !reason.trim()}
                  onClick={() => void run(() => requestTripCorrection(trip.id, reason))}
                  className="focus-ring inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-black text-primary-foreground disabled:opacity-35"
                >
                  <MailCheck className="size-4" aria-hidden /> Demander une correction
                </button>
                <button
                  type="button"
                  disabled={busy || !reason.trim()}
                  onClick={() => void run(() => rejectAdminTrip(trip.id, reason))}
                  className="focus-ring inline-flex items-center gap-2 rounded-full border border-error px-5 py-2.5 text-sm font-black text-error disabled:opacity-35"
                >
                  <X className="size-4" aria-hidden /> Refuser définitivement
                </button>
              </div>
            </section>
          ) : trip.status === "pending_automatic_verification" ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void run(() => takeTripForReview(trip.id))}
              className="focus-ring inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-black text-primary-foreground disabled:opacity-50"
            >
              {busy ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <FileSearch className="size-4" aria-hidden />}
              Prendre en charge ce voyage
            </button>
          ) : null}
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl bg-inverse-surface p-4 text-inverse-foreground">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">Règle de confiance</p>
            <p className="mt-2 font-display text-xl">Deux histoires doivent coïncider.</p>
            <p className="mt-2 text-xs leading-5 text-inverse-muted-foreground">
              Le nom du voyageur, le numéro de vol, les aéroports et les dates doivent
              raconter le même trajet. Un doute se corrige, il ne se devine jamais.
            </p>
          </section>
          <dl className="rounded-2xl border border-border p-4 text-sm">
            <Data label="Transmis" value={trip.submitted_at ? formatDateTime(trip.submitted_at) : "—"} />
            <Data label="Pris en charge" value={trip.review_started_at ? formatDateTime(trip.review_started_at) : "—"} />
            <Data label="Assigné à" value={trip.assigned_to?.slice(0, 8) ?? "Personne"} />
            <Data label="Méthode finale" value={trip.verification_method ? METHODS[trip.verification_method].label : "—"} />
          </dl>
        </aside>
      </div>
    </section>
  );
}

function ProofCard({
  tripId,
  proof,
  reviewing,
  busy,
  reason,
  onAccept,
  onReject,
}: {
  tripId: string;
  proof: AdminTripProof;
  reviewing: boolean;
  busy: boolean;
  reason: string;
  onAccept: () => Promise<void>;
  onReject: () => Promise<void>;
}) {
  const [opening, setOpening] = useState(false);
  const [openError, setOpenError] = useState<string | null>(null);
  const actionable = reviewing && proof.status === "uploaded";

  async function openProof() {
    setOpening(true);
    setOpenError(null);
    try {
      const url = await getTripProofUrl(tripId, proof.id);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (caught) {
      setOpenError(caught instanceof Error ? caught.message : "Ouverture impossible.");
    } finally {
      setOpening(false);
    }
  }

  return (
    <article className={`rounded-2xl border border-border p-4 ${proof.status === "replaced" ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <FileCheck2 className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="font-bold">{PROOF_KINDS[proof.kind].label} · v{proof.version}</h4>
          <p className="text-xs text-muted-foreground">{proofStatus(proof.status)} · {formatSize(proof.size_bytes)}</p>
          {proof.rejection_reason ? <p className="mt-1 text-xs leading-5 text-error">{proof.rejection_reason}</p> : null}
        </div>
      </div>
      <button
        type="button"
        disabled={opening}
        onClick={() => void openProof()}
        className="focus-ring mt-3 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-bold"
      >
        {opening ? <LoaderCircle className="size-3 animate-spin" aria-hidden /> : <ExternalLink className="size-3" aria-hidden />}
        Consulter la preuve
      </button>
      {openError ? <p className="mt-2 text-xs text-error">{openError}</p> : null}
      {actionable ? (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
          <button type="button" disabled={busy} onClick={() => void onAccept()} className="focus-ring rounded-full bg-success px-3 py-1.5 text-xs font-black text-white disabled:opacity-50">
            Accepter
          </button>
          <button type="button" disabled={busy || !reason.trim()} onClick={() => void onReject()} className="focus-ring rounded-full border border-error px-3 py-1.5 text-xs font-black text-error disabled:opacity-35">
            Refuser la preuve
          </button>
        </div>
      ) : null}
    </article>
  );
}

function methodHasEvidence(method: TripVerificationMethod, proofs: AdminTripProof[]) {
  if (method === "booking_api") return true;
  const accepted = proofs.filter((proof) => proof.status === "accepted");
  if (method === "boarding_pass") return accepted.some((proof) => proof.kind === "boarding_pass");
  if (method === "e_ticket_document") return accepted.some((proof) => proof.kind === "e_ticket");
  return accepted.length > 0;
}

function StatusPill({ status }: { status: TripStatus }) {
  const tone = status === "verified" ? "bg-success/10 text-success" : status === "rejected" ? "bg-error/10 text-error" : status === "action_required" ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary";
  return <span className={`rounded-full px-3 py-1.5 text-xs font-black ${tone}`}>{STATUS_LABELS[status]}</span>;
}

function SectionTitle({ icon: Icon, title }: { icon: typeof Route; title: string }) {
  return <h3 className="mb-3 flex items-center gap-2 text-sm font-black"><Icon className="size-4 text-primary" aria-hidden /> {title}</h3>;
}

function Data({ label, value }: { label: string; value: string }) {
  return <div className="border-b border-border py-2 last:border-0"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-0.5 font-semibold break-words">{value}</dd></div>;
}

function proofStatus(status: AdminTripProof["status"]) {
  return { uploaded: "À examiner", accepted: "Acceptée", rejected: "Refusée", replaced: "Ancienne version" }[status];
}

function formatSize(bytes: number) {
  return bytes < 1_000_000 ? `${Math.round(bytes / 1_000)} Ko` : `${(bytes / 1_000_000).toFixed(1)} Mo`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(value));
}
