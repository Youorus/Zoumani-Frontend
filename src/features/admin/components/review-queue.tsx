"use client";

import {
  AlertCircle,
  ArrowRight,
  Check,
  Clock3,
  ExternalLink,
  FileSearch,
  LoaderCircle,
  MailCheck,
  RefreshCw,
  ShieldCheck,
  UserRoundCheck,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { countryName } from "@/features/auth/lib/phone-countries";
import { AuthError } from "@/lib/auth/auth-client";

import {
  acceptDocument,
  approve,
  getVerification,
  listVerifications,
  reject,
  rejectDocument,
  requestAction,
  startReview,
  type AdminDetail,
  type AdminDocument,
  type AdminRequestKind,
  type AdminVerification,
  type AdminVerificationStatus,
} from "../api/admin-client";
import { AdminNav } from "./admin-nav";
import styles from "./review-queue.module.css";

const FILTERS: { value: AdminVerificationStatus; label: string }[] = [
  { value: "submitted", label: "À traiter" },
  { value: "resubmitted", label: "Revenus" },
  { value: "under_review", label: "En cours" },
  { value: "action_required", label: "Chez la personne" },
  { value: "verified", label: "Validés" },
  { value: "rejected", label: "Refusés" },
];

const STATUS_LABELS: Record<AdminVerificationStatus, string> = {
  submitted: "À prendre en charge",
  under_review: "Examen en cours",
  action_required: "Correction attendue",
  resubmitted: "Correction reçue",
  verified: "Identité vérifiée",
  rejected: "Dossier refusé",
};

const DOCUMENT_LABELS: Record<string, string> = {
  passport: "Passeport",
  national_id_card: "Carte d'identité",
  residence_permit: "Titre de séjour",
  selfie: "Photo avec la pièce",
};

const DOCUMENT_STATUS_LABELS: Record<string, string> = {
  uploaded: "À examiner",
  under_review: "En cours",
  accepted: "Acceptée",
  rejected: "À remplacer",
  replaced: "Ancienne version",
  expired: "Expirée",
};

const REQUEST_LABELS: Record<AdminRequestKind, string> = {
  replace_document: "Remplacer une pièce",
  add_document: "Ajouter une pièce",
  retake_selfie: "Reprendre la photo",
  provide_information: "Apporter une précision",
  correct_information: "Corriger une information légale",
};

const EVENT_LABELS: Record<string, string> = {
  verification_created: "Dossier ouvert",
  document_uploaded: "Pièce ajoutée",
  verification_submitted: "Dossier transmis",
  review_started: "Examen démarré",
  document_accepted: "Pièce acceptée",
  document_rejected: "Pièce refusée",
  action_requested: "Correction demandée",
  user_responded: "Réponse reçue",
  document_replaced: "Nouvelle version reçue",
  verification_resubmitted: "Dossier renvoyé",
  verification_approved: "Identité validée",
  verification_rejected: "Dossier refusé",
};

export function ReviewQueue() {
  const [filter, setFilter] = useState<AdminVerificationStatus>("submitted");
  const [queue, setQueue] = useState<AdminVerification[]>([]);
  const [opened, setOpened] = useState<AdminDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setQueue(await listVerifications(filter));
    } catch (caught) {
      setError(caught instanceof AuthError ? caught.message : "Chargement impossible.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    let cancelled = false;
    void listVerifications(filter)
      .then((result) => {
        if (!cancelled) {
          setQueue(result);
          setError(null);
        }
      })
      .catch((caught: unknown) => {
        if (!cancelled) {
          setError(
            caught instanceof AuthError ? caught.message : "Chargement impossible.",
          );
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
      setOpened(await getVerification(id));
    } catch (caught) {
      setError(caught instanceof AuthError ? caught.message : "Ouverture impossible.");
    }
  }

  async function act(action: () => Promise<void>) {
    setError(null);
    try {
      await action();
      const id = opened?.verification.id;
      await reload();
      if (id) setOpened(await getVerification(id));
    } catch (caught) {
      setError(caught instanceof AuthError ? caught.message : "Action impossible.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1492px] px-4 sm:px-8 lg:px-12">
      <AdminNav current="identity" />
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Atelier de confiance</p>
        <h1>Chaque badge engage Zoumani.</h1>
        <p>
          Ici, aucune validation automatique. Une personne regarde une personne,
          confronte ses preuves et explique chaque décision dans des mots qu&apos;elle
          pourra comprendre.
        </p>
      </header>

      <div className="my-5 flex flex-wrap items-center gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
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
          {queue.length} dossier{queue.length > 1 ? "s" : ""}
        </span>
        <button
          type="button"
          onClick={() => void reload()}
          className="focus-ring grid size-10 place-items-center rounded-full border border-border bg-surface hover:bg-muted"
          aria-label="Rafraîchir la file"
        >
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
        </button>
      </div>

      {error ? (
        <p className="mb-4 flex items-center gap-2 rounded-xl bg-error/10 p-3 text-sm text-error" role="alert">
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[22rem_1fr]">
        <section className={styles.queue} aria-label="File d'examen">
          {loading ? (
            <p className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              Chargement de la file…
            </p>
          ) : queue.length === 0 ? (
            <div className="grid min-h-44 place-items-center p-5 text-center">
              <ShieldCheck className="size-7 text-success" aria-hidden="true" />
              <p className="mt-2 text-sm font-semibold">Cette file est à jour.</p>
              <p className="text-xs text-muted-foreground">Aucun dossier à afficher.</p>
            </div>
          ) : (
            <ul className="m-0 list-none space-y-1 p-0">
              {queue.map((dossier) => {
                const active = opened?.verification.id === dossier.id;
                return (
                  <li key={dossier.id}>
                    <button
                      type="button"
                      onClick={() => void open(dossier.id)}
                      className={`focus-ring group w-full rounded-2xl border px-3.5 py-3 text-left transition-all ${
                        active
                          ? "border-primary/30 bg-primary/8 shadow-soft"
                          : "border-transparent hover:border-border hover:bg-muted"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 font-display font-bold text-primary">
                          {initials(dossier)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-bold">
                            {fullName(dossier)}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {country(dossier.nationality)} → {country(dossier.country_of_residence)}
                          </span>
                        </span>
                        <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {opened ? (
          <Dossier key={opened.verification.id} detail={opened} onAct={act} />
        ) : (
          <section className={`${styles.detail} grid min-h-96 place-items-center text-center`}>
            <div>
              <FileSearch className="mx-auto size-9 text-primary" aria-hidden="true" />
              <h2 className="mt-3 font-display text-2xl">Ouvrez un dossier</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                L&apos;identité, les pièces et toute l&apos;histoire apparaîtront ici.
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Dossier({
  detail,
  onAct,
}: {
  detail: AdminDetail;
  onAct: (action: () => Promise<void>) => Promise<void>;
}) {
  const { verification, documents, requests, events } = detail;
  const [reason, setReason] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [requestKind, setRequestKind] = useState<AdminRequestKind>("replace_document");
  const [targetDocumentId, setTargetDocumentId] = useState("");
  const [busy, setBusy] = useState(false);

  const reviewing = verification.status === "under_review";
  const canStart = ["submitted", "resubmitted"].includes(verification.status);
  const currentDocuments = documents.filter(
    (document) => document.status !== "replaced" && document.status !== "expired",
  );
  const allAccepted =
    currentDocuments.length > 0 &&
    currentDocuments.every((document) => document.status === "accepted");
  const targetsDocument = ["replace_document", "retake_selfie"].includes(requestKind);
  const targetOptions = currentDocuments.filter((document) =>
    requestKind === "retake_selfie" ? document.document_type === "selfie" : true,
  );

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
      <div className={styles.profileHeader}>
        <span className={styles.initials}>{initials(verification)}</span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black tracking-[0.12em] text-primary uppercase">
            Dossier {verification.id.slice(0, 8)}
          </p>
          <h2 className="truncate font-display text-2xl sm:text-3xl">
            {fullName(verification)}
          </h2>
          <p className="text-sm text-muted-foreground">
            {country(verification.nationality)} · réside en {country(verification.country_of_residence)}
          </p>
        </div>
        <StatusPill status={verification.status} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_17rem]">
        <div className="min-w-0 space-y-6">
          <section>
            <SectionTitle icon={UserRoundCheck} title="Identité déclarée" />
            <dl className="grid gap-3 rounded-2xl bg-muted/55 p-4 text-sm sm:grid-cols-2">
              <Data label="Prénom légal" value={verification.legal_first_name} />
              <Data label="Nom légal" value={verification.legal_last_name} />
              <Data label="Date de naissance" value={verification.date_of_birth} />
              <Data label="Nationalité" value={country(verification.nationality)} />
              <Data label="Pays de résidence" value={country(verification.country_of_residence)} />
              <Data label="Adresse" value={verification.residential_address} wide />
            </dl>
          </section>

          <section>
            <SectionTitle icon={FileSearch} title="Preuves reçues" />
            <div className="grid gap-3 md:grid-cols-2">
              {documents.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  reviewing={reviewing}
                  busy={busy}
                  reason={reason}
                  onAccept={() => run(() => acceptDocument(verification.id, document.id))}
                  onReject={() =>
                    run(async () => {
                      await rejectDocument(verification.id, document.id, reason);
                      setReason("");
                    })
                  }
                />
              ))}
            </div>
          </section>

          {reviewing ? (
            <section className="rounded-2xl border border-border bg-surface-elevated p-4 sm:p-5">
              <SectionTitle icon={MailCheck} title="Décision et message à la personne" />
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">
                  Motif de refus d&apos;une pièce ou du dossier
                </span>
                <Textarea
                  rows={2}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Expliquez ce qui est illisible et comment le corriger."
                />
              </label>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={busy || !allAccepted}
                  onClick={() => void run(() => approve(verification.id))}
                  title={allAccepted ? undefined : "Chaque pièce actuelle doit être acceptée"}
                  className="focus-ring inline-flex items-center gap-2 rounded-full bg-success px-5 py-3 text-sm font-black text-white disabled:opacity-40"
                >
                  <Check className="size-4" aria-hidden="true" /> Valider l&apos;identité
                </button>
                <button
                  type="button"
                  disabled={busy || !reason.trim()}
                  onClick={() => void run(() => reject(verification.id, reason))}
                  className="focus-ring inline-flex items-center gap-2 rounded-full border border-error px-5 py-3 text-sm font-black text-error disabled:opacity-40"
                >
                  <X className="size-4" aria-hidden="true" /> Refuser définitivement
                </button>
              </div>

              <div className="mt-5 border-t border-border pt-5">
                <p className="text-sm font-bold">Demander une correction sans tout refuser</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  La personne reçoit la consigne par e-mail, corrige uniquement ce point et
                  renvoie le même dossier.
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <Select
                    value={requestKind}
                    onValueChange={(value) => {
                      setRequestKind(value as AdminRequestKind);
                      setTargetDocumentId("");
                    }}
                  >
                    <SelectTrigger aria-label="Nature de la correction">
                      <span>{REQUEST_LABELS[requestKind]}</span>
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(REQUEST_LABELS) as AdminRequestKind[]).map((kind) => (
                        <SelectItem key={kind} value={kind}>
                          {REQUEST_LABELS[kind]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {targetsDocument ? (
                    <Select value={targetDocumentId} onValueChange={setTargetDocumentId}>
                      <SelectTrigger aria-label="Pièce à corriger">
                        <span>
                          {targetDocumentId
                            ? documentName(
                                targetOptions.find((item) => item.id === targetDocumentId),
                              )
                            : "Sélectionner la pièce"}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        {targetOptions.map((document) => (
                          <SelectItem key={document.id} value={document.id}>
                            {documentName(document)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : null}
                </div>
                <Textarea
                  className="mt-3"
                  rows={2}
                  value={requestMessage}
                  onChange={(event) => setRequestMessage(event.target.value)}
                  placeholder="Ex. Reprenez la photo de jour : le visage est trop sombre."
                />
                <button
                  type="button"
                  disabled={
                    busy ||
                    !requestMessage.trim() ||
                    (targetsDocument && !targetDocumentId)
                  }
                  onClick={() =>
                    void run(async () => {
                      await requestAction(
                        verification.id,
                        requestKind,
                        requestMessage,
                        targetsDocument ? targetDocumentId : undefined,
                      );
                      setRequestMessage("");
                      setTargetDocumentId("");
                    })
                  }
                  className="focus-ring mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-black text-primary-foreground disabled:opacity-40"
                >
                  <MailCheck className="size-4" aria-hidden="true" /> Envoyer la demande
                </button>
              </div>
            </section>
          ) : canStart ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void run(() => startReview(verification.id))}
              className="focus-ring inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-black text-primary-foreground shadow-soft disabled:opacity-50"
            >
              {busy ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <FileSearch className="size-4" aria-hidden="true" />}
              Prendre en charge ce dossier
            </button>
          ) : null}
        </div>

        <aside className="space-y-5">
          <section>
            <SectionTitle icon={Clock3} title="Histoire du dossier" />
            <ol className={styles.timeline}>
              {events.map((event) => (
                <li key={event.id}>
                  <span>
                    <strong className="block text-foreground">
                      {EVENT_LABELS[event.kind] ?? event.kind}
                    </strong>
                    {formatDateTime(event.occurred_at)}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          {requests.length > 0 ? (
            <section>
              <SectionTitle icon={MailCheck} title="Échanges" />
              <div className="space-y-2">
                {requests.map((request) => (
                  <div key={request.id} className="rounded-2xl border border-border p-3 text-xs">
                    <strong className="block">{REQUEST_LABELS[request.kind]}</strong>
                    <p className="mt-1 leading-5 text-muted-foreground">{request.message}</p>
                    {request.user_response ? (
                      <p className="mt-2 border-l-2 border-primary pl-2 leading-5">
                        {request.user_response}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </section>
  );
}

function DocumentCard({
  document,
  reviewing,
  busy,
  reason,
  onAccept,
  onReject,
}: {
  document: AdminDocument;
  reviewing: boolean;
  busy: boolean;
  reason: string;
  onAccept: () => Promise<void>;
  onReject: () => Promise<void>;
}) {
  const actionable = reviewing && ["uploaded", "under_review"].includes(document.status);
  const historical = document.status === "replaced";

  return (
    <article className={`${styles.documentCard} ${historical ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-primary">
          <FileSearch className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="font-bold">{documentName(document)}</h4>
          <p className="text-xs text-muted-foreground">
            {DOCUMENT_STATUS_LABELS[document.status] ?? document.status}
            {document.expires_on ? ` · expire le ${formatDate(document.expires_on)}` : ""}
          </p>
          {document.rejection_reason ? (
            <p className="mt-1 text-xs leading-5 text-error">{document.rejection_reason}</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href={document.front_url}
          target="_blank"
          rel="noreferrer"
          className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-bold hover:bg-muted"
        >
          Recto <ExternalLink className="size-3" aria-hidden="true" />
        </a>
        {document.back_url ? (
          <a
            href={document.back_url}
            target="_blank"
            rel="noreferrer"
            className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-bold hover:bg-muted"
          >
            Verso <ExternalLink className="size-3" aria-hidden="true" />
          </a>
        ) : null}
      </div>

      {actionable ? (
        <div className="flex flex-wrap gap-2 border-t border-border pt-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => void onAccept()}
            className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-success px-3 py-1.5 text-xs font-black text-white disabled:opacity-50"
          >
            <Check className="size-3.5" aria-hidden="true" /> Accepter
          </button>
          <button
            type="button"
            disabled={busy || !reason.trim()}
            onClick={() => void onReject()}
            title="Écrivez d'abord le motif dans la zone de décision"
            className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-error px-3 py-1.5 text-xs font-black text-error disabled:opacity-35"
          >
            <X className="size-3.5" aria-hidden="true" /> Refuser
          </button>
        </div>
      ) : null}
    </article>
  );
}

function StatusPill({ status }: { status: AdminVerificationStatus }) {
  const tone =
    status === "verified"
      ? "bg-success/10 text-success"
      : status === "rejected"
        ? "bg-error/10 text-error"
        : status === "action_required"
          ? "bg-warning/10 text-warning"
          : "bg-primary/10 text-primary";
  return (
    <span className={`rounded-full px-3 py-1.5 text-xs font-black ${tone}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: typeof Clock3; title: string }) {
  return (
    <h3 className="mb-3 flex items-center gap-2 text-sm font-black">
      <Icon className="size-4 text-primary" aria-hidden="true" /> {title}
    </h3>
  );
}

function Data({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string | null;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-semibold break-words">{value || "—"}</dd>
    </div>
  );
}

function fullName(verification: AdminVerification) {
  return [verification.legal_first_name, verification.legal_last_name]
    .filter(Boolean)
    .join(" ") || "Identité à compléter";
}

function initials(verification: AdminVerification) {
  return [verification.legal_first_name, verification.legal_last_name]
    .filter(Boolean)
    .map((part) => part?.[0]?.toUpperCase())
    .join("") || "?";
}

function country(code: string | null) {
  return code ? countryName(code, "fr") : "Pays non renseigné";
}

function documentName(document: AdminDocument | undefined) {
  if (!document) return "Pièce introuvable";
  return `${DOCUMENT_LABELS[document.document_type] ?? document.document_type} · v${document.version}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(
    new Date(`${value}T00:00:00`),
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
