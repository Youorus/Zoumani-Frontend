"use client";

import { AlertCircle, Check, LoaderCircle, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AuthError } from "@/lib/auth/auth-client";

import {
  fetchDocuments,
  replaceDocument,
  respondToRequest,
  resubmitVerification,
} from "../api/verification-client";
import type { VerificationCopy } from "../content/verification-content";
import type { VerificationRequest } from "../types/verification.types";
import { FileField } from "./file-field";

/**
 * Ce qu'un opérateur demande, et comment y répondre.
 *
 * ═══ Pourquoi cet écran est le plus important du parcours ═══
 *
 * Un dossier en correction est **bloqué des deux côtés** : la personne
 * croit attendre, l'opérateur attend réellement. Sans écran pour le dire,
 * rien n'avance jusqu'à ce que l'un des deux écrive au support — et
 * beaucoup abandonnent avant.
 *
 * ═══ Le message de l'opérateur est repris mot pour mot ═══
 *
 * On ne le reformule pas, on ne le résume pas. Il a été écrit pour être
 * lu par cette personne-là, à propos de ce document-là : le remplacer par
 * une phrase générique — « un document est invalide » — reviendrait à ne
 * rien dire.
 *
 * ═══ Chaque demande porte sa propre réponse ═══
 *
 * Un champ commun pour trois demandes obligerait à deviner à laquelle
 * une phrase se rapporte, côté opérateur comme côté personne.
 */
export function CorrectionsView({
  copy,
  requests,
}: {
  copy: VerificationCopy;
  requests: VerificationRequest[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [issuingCountry, setIssuingCountry] = useState("");
  const [pieces, setPieces] = useState<{ id: string; documentType: string }[]>([]);

  const enAttente = requests.filter((request) => !request.answered);

  // Chargées au montage : une demande « reprenez votre photo » ne dit pas
  // **quelle** pièce remplacer, et sans cette liste on ajouterait un
  // second selfie au lieu de corriger le premier.
  useEffect(() => {
    void fetchDocuments().then(setPieces);
  }, []);

  async function envoyer(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      for (const request of enAttente) {
        const fichier = files[request.id] ?? null;

        // Le fichier d'abord : répondre à une demande la clôt côté
        // serveur, et une pièce envoyée après ne serait plus rattachée à
        // ce qui la justifiait.
        //
        // **On remplace, on n'ajoute pas.** Un dossier transmis est gelé :
        // le serveur refuse toute pièce supplémentaire — et l'ajouter
        // laisserait de toute façon l'ancienne en place, alors que c'est
        // précisément elle qu'on demande de corriger.
        if (fichier) {
          const selfie = request.kind === "retake_selfie";
          const cible =
            request.documentId ??
            pieces.find((piece) =>
              selfie ? piece.documentType === "selfie" : piece.documentType !== "selfie",
            )?.id;

          if (cible) {
            await replaceDocument(cible, {
              documentType: selfie ? "selfie" : "passport",
              front: fichier,
              issuingCountry: selfie ? undefined : issuingCountry || undefined,
            });
          }
        }
        await respondToRequest(request.id, answers[request.id] ?? "");
      }

      await resubmitVerification();
      // La page se recharge côté serveur : l'état, le badge de l'en-tête
      // et le menu suivent dans le même mouvement.
      router.refresh();
    } catch (caught) {
      setError(caught instanceof AuthError ? caught.message : copy.errors.generic);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={envoyer} noValidate className="mx-auto w-full max-w-2xl">
      <header className="mb-6">
        <h1 className="font-display text-2xl text-foreground sm:text-3xl">
          {copy.corrections.title}
        </h1>
        <p className="mt-2 leading-6 text-muted-foreground">{copy.corrections.body}</p>
      </header>

      {enAttente.map((request, index) => (
        <section key={request.id} className="panel-surface mb-4 p-5">
          <p className="mb-3 flex items-start gap-3 text-sm leading-6">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-warning/15 text-warning">
              <MessageSquare className="size-4" aria-hidden="true" />
            </span>
            <span>
              <strong className="block">
                {copy.corrections.kinds[request.kind]}
                {enAttente.length > 1 ? ` (${index + 1}/${enAttente.length})` : ""}
              </strong>
              {/* Mot pour mot. Voir la docstring du composant. */}
              {request.message}
            </span>
          </p>

          {request.kind !== "provide_information" &&
          request.kind !== "correct_information" ? (
            <FileField
              label={copy.corrections.newFile}
              chooseLabel={copy.document.choose}
              accept={request.kind === "retake_selfie" ? "image/*" : undefined}
              onChange={(file) => setFiles({ ...files, [request.id]: file })}
            />
          ) : null}

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">
              {copy.corrections.answer}
            </span>
            <Textarea
              rows={2}
              placeholder={copy.corrections.answerPlaceholder}
              value={answers[request.id] ?? ""}
              onChange={(e) => setAnswers({ ...answers, [request.id]: e.target.value })}
            />
          </label>
        </section>
      ))}

      {enAttente.some((request) => request.kind === "replace_document") ? (
        <section className="panel-surface mb-4 p-5">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">
              {copy.document.issuingCountry}
            </span>
            <Input
              maxLength={2}
              placeholder="CM"
              value={issuingCountry}
              onChange={(e) => setIssuingCountry(e.target.value.toUpperCase())}
            />
          </label>
        </section>
      ) : null}

      {error ? (
        <p className="mb-4 flex items-center gap-2 text-sm text-error" role="alert">
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-bold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60 sm:w-auto"
      >
        {busy ? (
          <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
        ) : (
          <Check className="size-5" aria-hidden="true" />
        )}
        {busy ? copy.submitting : copy.corrections.submit}
      </button>
    </form>
  );
}
