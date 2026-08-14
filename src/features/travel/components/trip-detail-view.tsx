"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  cancelTrip,
  deleteTrip,
  publishCapacity,
  submitTrip,
  uploadProof,
  withdrawCapacity,
} from "../api/travel-client";
import type { Capacity } from "../types/travel.types";
import type { Proof, ProofKind, Trip } from "../types/trip.types";
import { AttestationField } from "./attestation-field";
import { PROOF_KINDS, ProofPicker } from "./proof-picker";
import { TripRoute } from "./trip-route";

interface TripDetailViewProps {
  trip: Trip;
  capacity: Capacity | null;
  proofs: Proof[];
}

/**
 * Un voyage et tout ce qu'on peut en faire.
 *
 * ═══ L'écran commence par ce qu'il reste à faire ═══
 *
 * Un voyageur qui ouvre cette page ne vient pas relire son itinéraire :
 * il vient savoir où en est son dossier et ce qu'on attend de lui. La
 * prochaine action est donc en haut, nommée, avec son bouton — et non
 * dispersée en bas de trois sections qu'il faudrait parcourir.
 *
 * ═══ Chaque état a une seule action suivante ═══
 *
 * Brouillon sans billet → déposer le billet. Brouillon avec billet →
 * transmettre. En examen → rien, et le dire est une information à part
 * entière. À corriger → reprendre. Vérifié sans offre publiée →
 * publier.
 *
 * Proposer tout en permanence obligerait à deviner laquelle compte.
 */
export function TripDetailView({ trip, capacity, proofs }: TripDetailViewProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [attestation, setAttestation] = useState({ accepted: false, version: "" });
  const [confirming, setConfirming] = useState(false);

  const vivantes = proofs.filter((proof) => proof.status !== "replaced");
  const aUnBillet = vivantes.length > 0;

  async function faire(action: () => Promise<unknown>) {
    setBusy(true);
    setFailure(null);
    try {
      await action();
      router.refresh();
    } catch (error) {
      setFailure(error instanceof Error ? error.message : "L'opération n'a pas abouti.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5 p-4 sm:p-6">
      <header>
        <Link
          href="/compte/trajets"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Mes trajets
        </Link>
        <h1 className="sr-only">
          {trip.originAirportCode} vers {trip.destinationAirportCode}
        </h1>
        <div className="mt-2">
          <TripRoute
            origin={{ code: trip.originAirportCode }}
            destination={{ code: trip.destinationAirportCode }}
          />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatUtc(trip.departureAt)} · heure UTC
        </p>
      </header>

      <ProchaineAction
        trip={trip}
        capacity={capacity}
        aUnBillet={aUnBillet}
        busy={busy}
        attestation={attestation}
        onAttestationChange={(accepted, version) => setAttestation({ accepted, version })}
        onSubmit={() => faire(() => submitTrip(trip.id, attestation.version))}
        onPublish={() => capacity && faire(() => publishCapacity(capacity.id))}
      />

      {failure && (
        <p
          className="rounded-xl border border-error/40 bg-error/10 p-3 text-sm"
          role="alert"
        >
          {failure}
        </p>
      )}

      <section className="rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-medium">Itinéraire</h2>
          {trip.isEditable && (
            <Link
              href={`/trips/${trip.id}/modifier`}
              className="text-sm text-muted-foreground underline"
            >
              Modifier
            </Link>
          )}
        </div>
        <ul className="mt-3 space-y-2.5">
          {trip.segments.map((segment) => (
            <li key={segment.segmentOrder} className="text-sm">
              <p className="font-medium">
                {segment.airlineCode}
                {segment.flightNumber} · {segment.originAirportCode} →{" "}
                {segment.destinationAirportCode}
              </p>
              <p className="text-muted-foreground">
                {formatUtc(segment.departureAt)} → {formatUtc(segment.arrivalAt)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <ProofsSection
        tripId={trip.id}
        proofs={vivantes}
        modifiable={trip.stage === "brouillon" || trip.stage === "a_corriger"}
        onUploaded={() => router.refresh()}
      />

      {capacity ? (
        <CapacitySection
          tripId={trip.id}
          capacity={capacity}
          busy={busy}
          onWithdraw={() => faire(() => withdrawCapacity(capacity.id))}
        />
      ) : (
        trip.stage !== "clos" && (
          <section className="rounded-2xl border border-border p-4">
            <h2 className="text-sm font-medium">Votre offre</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ce voyage ne propose pas encore de place aux expéditeurs.
            </p>
            <Link
              href={`/trips/${trip.id}/offre`}
              className="mt-3 inline-block rounded-lg border border-border px-3 py-2 text-sm"
            >
              Proposer de la place
            </Link>
          </section>
        )
      )}

      {trip.stage !== "clos" && (
        <section className="rounded-2xl border border-border p-4">
          <h2 className="text-sm font-medium">
            {trip.stage === "brouillon" ? "Supprimer ce voyage" : "Annuler ce voyage"}
          </h2>
          {confirming ? (
            <div className="mt-3 space-y-2.5">
              {trip.stage !== "brouillon" && (
                <p className="text-sm text-muted-foreground">
                  Des expéditeurs peuvent compter sur ce voyage. Une annulation après
                  vérification retire <span className="font-medium">250 points</span> de
                  votre programme de fidélité.
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    faire(async () => {
                      if (trip.stage === "brouillon") {
                        await deleteTrip(trip.id);
                      } else {
                        await cancelTrip(trip.id);
                      }
                      router.push("/compte/trajets");
                    })
                  }
                  className="rounded-lg bg-error px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  {busy ? "…" : "Confirmer"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="rounded-lg px-3 py-2 text-sm text-muted-foreground"
                >
                  Revenir
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="mt-3 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground"
            >
              {trip.stage === "brouillon" ? "Supprimer" : "Annuler ce voyage"}
            </button>
          )}
        </section>
      )}
    </div>
  );
}

/**
 * Ce qu'on attend du voyageur, maintenant.
 *
 * Une seule action à la fois. Un dossier a un état, et cet état
 * détermine le geste suivant : le montrer seul évite d'avoir à choisir.
 */
function ProchaineAction({
  trip,
  capacity,
  aUnBillet,
  busy,
  attestation,
  onAttestationChange,
  onSubmit,
  onPublish,
}: {
  trip: Trip;
  capacity: Capacity | null;
  aUnBillet: boolean;
  busy: boolean;
  attestation: { accepted: boolean; version: string };
  onAttestationChange: (accepted: boolean, version: string) => void;
  onSubmit: () => void;
  onPublish: () => void;
}) {
  if (trip.stage === "en_attente" && trip.status !== "verified") {
    return (
      <Encadre ton="attente" titre="Votre dossier est en cours d'examen">
        Nous confrontons votre billet à votre identité. Rien à faire de votre côté — vous
        recevrez un e-mail dès qu&apos;il sera tranché.
      </Encadre>
    );
  }

  if (trip.status === "verified") {
    if (capacity && capacity.status !== "published") {
      return (
        <Encadre ton="action" titre="Votre voyage est vérifié">
          <p>
            Publiez votre offre pour qu&apos;elle apparaisse dans les recherches des
            expéditeurs.
          </p>
          <button
            type="button"
            onClick={onPublish}
            disabled={busy}
            className="mt-3 w-full rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground disabled:opacity-40"
          >
            {busy ? "…" : "Publier mon offre"}
          </button>
        </Encadre>
      );
    }
    return (
      <Encadre ton="ok" titre="Votre offre est en ligne">
        Les expéditeurs peuvent réserver de la place sur ce voyage.
      </Encadre>
    );
  }

  if (trip.stage === "clos") {
    return null;
  }

  if (!aUnBillet) {
    return (
      <Encadre ton="action" titre="Déposez votre billet">
        Nous ne pouvons pas vérifier un voyage sans justificatif. Ajoutez votre billet ou
        votre carte d&apos;embarquement ci-dessous — c&apos;est la dernière étape.
      </Encadre>
    );
  }

  return (
    <Encadre
      ton="action"
      titre={
        trip.stage === "a_corriger"
          ? "Renvoyez votre dossier"
          : "Transmettez votre dossier"
      }
    >
      <p>
        {trip.correctionNote ??
          "Votre billet est en place. Transmettez pour lancer la vérification."}
      </p>
      <div className="mt-3 space-y-3">
        <AttestationField
          accepted={attestation.accepted}
          onChange={onAttestationChange}
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={busy || !attestation.accepted}
          className="w-full rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground disabled:opacity-40"
        >
          {busy ? "…" : "Transmettre à la vérification"}
        </button>
      </div>
    </Encadre>
  );
}

function Encadre({
  ton,
  titre,
  children,
}: {
  ton: "action" | "attente" | "ok";
  titre: string;
  children: React.ReactNode;
}) {
  const tons = {
    action: "border-primary/40 bg-primary/5",
    attente: "border-border bg-muted/50",
    ok: "border-emerald-500/40 bg-emerald-500/10",
  };
  return (
    <section className={`rounded-2xl border p-4 ${tons[ton]}`}>
      <h2 className="font-medium">{titre}</h2>
      <div className="mt-1 text-sm text-muted-foreground">{children}</div>
    </section>
  );
}

function ProofsSection({
  tripId,
  proofs,
  modifiable,
  onUploaded,
}: {
  tripId: string;
  proofs: Proof[];
  modifiable: boolean;
  onUploaded: () => void;
}) {
  const [kind, setKind] = useState<ProofKind>("boarding_pass");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  async function deposer(file: File) {
    setBusy(true);
    setFailure(null);
    try {
      await uploadProof(tripId, kind, file);
      onUploaded();
    } catch (error) {
      setFailure(error instanceof Error ? error.message : "L'envoi n'a pas abouti.");
    } finally {
      setBusy(false);
      setFile(null);
    }
  }

  return (
    <section className="rounded-2xl border border-border p-4">
      <h2 className="text-sm font-medium">Justificatifs</h2>

      {proofs.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {proofs.map((proof) => (
            <li
              key={proof.id}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="min-w-0">
                <span className="block">{PROOF_KINDS[proof.kind].label}</span>
                {proof.rejectionReason && (
                  <span className="block text-xs text-error">
                    {proof.rejectionReason}
                  </span>
                )}
              </span>
              <StatutPreuve status={proof.status} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">Aucun justificatif déposé.</p>
      )}

      {modifiable && (
        <div className="mt-4 space-y-2.5 border-t border-border pt-4">
          <ProofPicker
            kind={kind}
            file={file}
            onKindChange={setKind}
            onFileChange={setFile}
            disabled={busy}
          />
          <button
            type="button"
            disabled={!file || busy}
            onClick={() => file && void deposer(file)}
            className="focus-ring w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-40"
          >
            {busy ? "Envoi en cours…" : "Déposer ce justificatif"}
          </button>
          {failure && (
            <p className="text-sm text-error" role="alert">
              {failure}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function StatutPreuve({ status }: { status: Proof["status"] }) {
  const libelles: Record<Proof["status"], { texte: string; classe: string }> = {
    uploaded: { texte: "En attente", classe: "bg-muted text-muted-foreground" },
    accepted: { texte: "Accepté", classe: "bg-emerald-500/15 text-emerald-700" },
    rejected: { texte: "Refusé", classe: "bg-error/10 text-error" },
    replaced: { texte: "Remplacé", classe: "bg-muted text-muted-foreground" },
  };
  const badge = libelles[status];
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs ${badge.classe}`}>
      {badge.texte}
    </span>
  );
}

function CapacitySection({
  tripId,
  capacity,
  busy,
  onWithdraw,
}: {
  tripId: string;
  capacity: Capacity;
  busy: boolean;
  onWithdraw: () => void;
}) {
  return (
    <section className="rounded-2xl border border-border p-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-medium">Votre offre</h2>
        <span className="text-xs text-muted-foreground">
          {capacity.status === "published"
            ? "En ligne"
            : capacity.status === "withdrawn"
              ? "Retirée"
              : "Brouillon"}
        </span>
      </div>

      <p className="mt-2 text-sm">
        <span className="font-medium">{capacity.totalWeightKg} kg</span>
        <span className="text-muted-foreground">
          {" "}
          proposés · {capacity.availableWeightKg} kg encore libres
        </span>
      </p>

      <ul className="mt-3 space-y-1.5 text-sm">
        {capacity.offers.map((offer) => (
          <li key={offer.categoryCode} className="flex justify-between gap-4">
            <span className="text-muted-foreground">{offer.categoryCode}</span>
            <span className="shrink-0 font-medium">
              {offer.priceMajor} € {offer.perPiece ? "/ pièce" : "/ kg"}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex flex-wrap gap-2">
        {/* Toujours proposé : l'écran d'édition explique lui-même ce
            qu'il faut faire d'abord quand l'offre est en ligne, plutôt
            que de cacher le lien et de laisser deviner. */}
        <Link
          href={`/trips/${tripId}/offre`}
          className="rounded-lg border border-border px-3 py-2 text-sm"
        >
          Modifier mon offre
        </Link>
        {capacity.status === "published" && (
          <button
            type="button"
            onClick={onWithdraw}
            disabled={busy}
            className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground disabled:opacity-50"
          >
            Retirer du marché
          </button>
        )}
      </div>
      {capacity.status === "published" &&
        capacity.availableWeightKg < capacity.totalWeightKg && (
          <p className="mt-2 text-xs text-muted-foreground">
            Des expéditeurs ont déjà réservé. Retirer l&apos;offre cesse d&apos;en
            proposer davantage, sans annuler ce qui est engagé.
          </p>
        )}
    </section>
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
