"use client";

import { AlertCircle, Check, LoaderCircle, RefreshCw, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  type AdminVerification,
} from "../api/admin-client";

/**
 * La file d'examen des identités.
 *
 * ═══ Ce que cet écran n'est pas ═══
 *
 * Pas un tableau de bord. Un opérateur qui ouvre cette page vient
 * traiter des dossiers, pas contempler des courbes. La file d'abord, le
 * dossier ouvert à côté, les trois décisions à portée de clic.
 *
 * ═══ Pourquoi les trois décisions ne se ressemblent pas ═══
 *
 * Valider, refuser et demander une correction n'ont pas les mêmes
 * conséquences : la première ouvre la plateforme, la deuxième ferme le
 * dossier, la troisième le renvoie à la personne. Un menu déroulant les
 * mettrait sur le même plan et rendrait le refus aussi facile qu'une
 * question — alors qu'un refus coûte un dossier entier à refaire.
 *
 * ═══ Le motif est obligatoire, et l'interface le rend impossible à sauter ═══
 *
 * Le bouton reste inactif tant que rien n'est écrit. Sans motif, la
 * personne renvoie le même document et se fait refuser une seconde fois.
 */

const FILTRES = [
  { valeur: "submitted", libelle: "À traiter" },
  { valeur: "under_review", libelle: "En cours" },
  { valeur: "action_required", libelle: "En attente d'elle" },
  { valeur: "resubmitted", libelle: "Revenus" },
  { valeur: "verified", libelle: "Validés" },
  { valeur: "rejected", libelle: "Refusés" },
] as const;

export function ReviewQueue() {
  const [filtre, setFiltre] = useState<string>("submitted");
  const [file, setFile] = useState<AdminVerification[]>([]);
  const [ouvert, setOuvert] = useState<AdminDetail | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const recharger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      setFile(await listVerifications(filtre));
    } catch (caught) {
      setErreur(caught instanceof AuthError ? caught.message : "Chargement impossible.");
    } finally {
      setChargement(false);
    }
  }, [filtre]);

  // Le chargement part dans une micro-tâche : appeler `setState`
  // pendant l'effet lui-même déclenche un second rendu en cascade, que
  // React signale — et qui se voit sur une liste longue.
  useEffect(() => {
    let annule = false;
    void listVerifications(filtre)
      .then((resultat) => {
        if (!annule) {
          setFile(resultat);
          setErreur(null);
        }
      })
      .catch((caught: unknown) => {
        if (!annule) {
          setErreur(
            caught instanceof AuthError ? caught.message : "Chargement impossible.",
          );
        }
      })
      .finally(() => {
        if (!annule) {
          setChargement(false);
        }
      });
    return () => {
      annule = true;
    };
  }, [filtre]);

  async function ouvrir(id: string) {
    setErreur(null);
    try {
      setOuvert(await getVerification(id));
    } catch (caught) {
      setErreur(caught instanceof AuthError ? caught.message : "Ouverture impossible.");
    }
  }

  /** Rejoue une action puis rafraîchit les deux vues d'un coup. */
  async function agir(action: () => Promise<void>) {
    setErreur(null);
    try {
      await action();
      const id = ouvert?.verification.id;
      await recharger();
      if (id) {
        setOuvert(await getVerification(id));
      }
    } catch (caught) {
      setErreur(caught instanceof AuthError ? caught.message : "Action impossible.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1492px] px-4 sm:px-8 lg:px-12">
      <header className="mb-5">
        <h1 className="font-display text-2xl text-foreground sm:text-3xl">
          Vérification des identités
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Chaque décision part par e-mail à la personne concernée, dans sa langue.
        </p>
      </header>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {FILTRES.map((item) => (
          <button
            key={item.valeur}
            type="button"
            onClick={() => setFiltre(item.valeur)}
            className={`focus-ring rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              filtre === item.valeur
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:bg-muted"
            }`}
          >
            {item.libelle}
          </button>
        ))}
        <button
          type="button"
          onClick={() => void recharger()}
          className="focus-ring ml-auto grid size-9 place-items-center rounded-full border border-border hover:bg-muted"
          aria-label="Rafraîchir la file"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
        </button>
      </div>

      {erreur ? (
        <p className="mb-4 flex items-center gap-2 text-sm text-error" role="alert">
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          {erreur}
        </p>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[22rem_1fr]">
        <section className="panel-surface p-3" aria-label="File d'examen">
          {chargement ? (
            <p className="p-4 text-sm text-muted-foreground">Chargement…</p>
          ) : file.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              Aucun dossier dans cette file.
            </p>
          ) : (
            <ul className="m-0 list-none space-y-1 p-0">
              {file.map((dossier) => (
                <li key={dossier.id}>
                  <button
                    type="button"
                    onClick={() => void ouvrir(dossier.id)}
                    className={`focus-ring w-full rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted ${
                      ouvert?.verification.id === dossier.id ? "bg-muted" : ""
                    }`}
                  >
                    <span className="block truncate font-semibold">
                      {dossier.legal_first_name} {dossier.legal_last_name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {dossier.nationality} · {dossier.country_of_residence} ·{" "}
                      {dossier.submitted_at?.slice(0, 10) ?? "—"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {ouvert ? (
          <Dossier detail={ouvert} onAgir={agir} />
        ) : (
          <section className="panel-surface grid place-items-center p-10 text-sm text-muted-foreground">
            Sélectionnez un dossier à gauche.
          </section>
        )}
      </div>
    </div>
  );
}

function Dossier({
  detail,
  onAgir,
}: {
  detail: AdminDetail;
  onAgir: (action: () => Promise<void>) => Promise<void>;
}) {
  const { verification, documents } = detail;
  const [motif, setMotif] = useState("");
  const [demande, setDemande] = useState("");
  const [occupe, setOccupe] = useState(false);

  const enCours = verification.status === "under_review";
  const toutesStatuees = documents.every(
    (doc) => doc.status === "accepted" || doc.status === "rejected",
  );

  async function lancer(action: () => Promise<void>) {
    setOccupe(true);
    await onAgir(action);
    setOccupe(false);
  }

  const lignes: [string, string | null][] = [
    ["Prénom légal", verification.legal_first_name],
    ["Nom légal", verification.legal_last_name],
    ["Naissance", verification.date_of_birth],
    ["Nationalité", verification.nationality],
    ["Pays de résidence", verification.country_of_residence],
    ["Adresse", verification.residential_address],
  ];

  return (
    <section className="panel-surface p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl">
          {verification.legal_first_name} {verification.legal_last_name}
        </h2>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">
          {verification.status}
        </span>
      </div>

      <dl className="mb-5 grid gap-2 text-sm sm:grid-cols-2">
        {lignes.map(([label, valeur]) => (
          <div key={label} className="flex gap-2">
            <dt className="w-36 shrink-0 text-muted-foreground">{label}</dt>
            <dd className="m-0 min-w-0 font-medium break-words">{valeur ?? "—"}</dd>
          </div>
        ))}
      </dl>

      <h3 className="mb-2 text-sm font-bold">Pièces</h3>
      <ul className="mb-5 m-0 list-none space-y-2 p-0">
        {documents.map((doc) => (
          <li
            key={doc.id}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3"
          >
            <span className="min-w-0 flex-1">
              <span className="block font-medium">{doc.document_type}</span>
              <span className="block text-xs text-muted-foreground">
                {doc.status}
                {doc.expires_on ? ` · expire le ${doc.expires_on}` : ""}
              </span>
            </span>
            {/* Ouvre le lien signé dans un onglet : l'API ne rend jamais
                l'emplacement réel du fichier, seulement une URL à durée
                limitée recalculée à chaque lecture. */}
            <a
              href={doc.front_url}
              target="_blank"
              rel="noreferrer"
              className="focus-ring rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted"
            >
              Voir
            </a>
            {doc.back_url ? (
              <a
                href={doc.back_url}
                target="_blank"
                rel="noreferrer"
                className="focus-ring rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted"
              >
                Verso
              </a>
            ) : null}
            {enCours && doc.status === "uploaded" ? (
              <>
                <button
                  type="button"
                  disabled={occupe}
                  onClick={() =>
                    void lancer(() => acceptDocument(verification.id, doc.id))
                  }
                  className="focus-ring rounded-lg bg-success px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  <Check className="inline size-4" aria-hidden="true" /> Accepter
                </button>
                <button
                  type="button"
                  disabled={occupe || !motif.trim()}
                  onClick={() =>
                    void lancer(() => rejectDocument(verification.id, doc.id, motif))
                  }
                  title="Renseignez d'abord un motif ci-dessous"
                  className="focus-ring rounded-lg border border-error px-3 py-1.5 text-sm font-semibold text-error disabled:opacity-40"
                >
                  <X className="inline size-4" aria-hidden="true" /> Refuser
                </button>
              </>
            ) : null}
          </li>
        ))}
      </ul>

      {!enCours ? (
        <button
          type="button"
          disabled={occupe || verification.status === "verified"}
          onClick={() => void lancer(() => startReview(verification.id))}
          className="focus-ring inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground disabled:opacity-50"
        >
          {occupe ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          ) : null}
          Prendre en charge
        </button>
      ) : (
        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">
              Motif — obligatoire pour tout refus
            </span>
            <Textarea
              rows={2}
              value={motif}
              onChange={(event) => setMotif(event.target.value)}
              placeholder="Le document est illisible sur les bords."
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={occupe || !toutesStatuees}
              onClick={() => void lancer(() => approve(verification.id))}
              title={toutesStatuees ? undefined : "Statuez d'abord sur chaque pièce"}
              className="focus-ring inline-flex items-center gap-2 rounded-xl bg-success px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              <Check className="size-4" aria-hidden="true" /> Valider l&apos;identité
            </button>
            <button
              type="button"
              disabled={occupe || !motif.trim()}
              onClick={() => void lancer(() => reject(verification.id, motif))}
              className="focus-ring inline-flex items-center gap-2 rounded-xl border border-error px-5 py-3 text-sm font-bold text-error disabled:opacity-40"
            >
              <X className="size-4" aria-hidden="true" /> Refuser le dossier
            </button>
          </div>

          <div className="rounded-xl border border-dashed border-border p-4">
            <span className="mb-1.5 block text-sm font-medium">
              Ou demander une correction, sans refuser
            </span>
            <p className="mb-2 text-xs text-muted-foreground">
              Le dossier repart vers la personne, qui peut corriger et le renvoyer. Rien
              n&apos;est perdu.
            </p>
            <Input
              value={demande}
              onChange={(event) => setDemande(event.target.value)}
              placeholder="Reprenez la photo de jour, le visage est trop sombre."
            />
            <button
              type="button"
              disabled={occupe || !demande.trim()}
              onClick={() =>
                void lancer(async () => {
                  await requestAction(verification.id, "retake_selfie", demande);
                  setDemande("");
                })
              }
              className="focus-ring mt-3 rounded-xl border border-border px-4 py-2 text-sm font-semibold disabled:opacity-40"
            >
              Demander une correction
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
