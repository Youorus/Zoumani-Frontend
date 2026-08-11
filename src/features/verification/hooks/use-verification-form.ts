"use client";

import { useCallback, useState } from "react";

import { AuthError } from "@/lib/auth/auth-client";

import {
  saveDraft,
  startVerification,
  submitVerification,
  uploadDocument,
  uploadSelfie,
  type IdentityDraft,
} from "../api/verification-client";
import type { Verification } from "../types/verification.types";

export type DocumentType = "passport" | "national_id" | "residence_permit";

export interface VerificationFiles {
  documentType: DocumentType;
  front: File | null;
  back: File | null;
  issuingCountry: string;
  expiresOn: string;
  selfie: File | null;
}

/**
 * L'envoi d'un dossier, du premier champ à la transmission.
 *
 * ═══ Pourquoi tout part en une fois, alors que l'API a quatre routes ═══
 *
 * Le serveur distingue ouvrir un dossier, l'enregistrer, y joindre des
 * pièces, puis le transmettre. C'est la bonne découpe **pour lui** : elle
 * permet de reprendre un dossier abandonné et de remplacer une pièce
 * seule.
 *
 * Pour la personne, il n'y a qu'un geste : « j'envoie mes informations ».
 * Lui faire vivre quatre étapes séparées multiplierait les endroits où
 * abandonner, sur l'écran où l'on abandonne déjà le plus.
 *
 * ═══ Pourquoi l'ordre compte ═══
 *
 * Le dossier est ouvert, puis renseigné, puis garni, puis transmis. Le
 * serveur refuse une pièce sans dossier et une transmission sans pièce ;
 * inverser deux appels produit un 409 que rien n'explique à l'écran.
 */
export function useVerificationForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const send = useCallback(
    async (
      draft: IdentityDraft,
      files: VerificationFiles,
    ): Promise<Verification | null> => {
      setBusy(true);
      setError(null);
      try {
        // Appelé systématiquement. Deux situations, un seul geste :
        //
        // - un dossier vivant existe → l'API répond 409, qu'on avale ;
        // - le précédent a été refusé → l'API en ouvre un **nouveau**,
        //   ce qui est exactement ce qu'exige sa machine à états. Un
        //   dossier refusé ne se rouvre pas : il se remplace, et
        //   l'historique du premier est conservé pour l'examen.
        await startVerification();
        await saveDraft(draft);

        if (files.front) {
          await uploadDocument({
            documentType: files.documentType,
            front: files.front,
            back: files.back,
            issuingCountry: files.issuingCountry,
            expiresOn: files.expiresOn || undefined,
          });
        }
        if (files.selfie) {
          await uploadSelfie(files.selfie);
        }

        // Toujours `submit`, jamais `resubmit` : ce dernier appartient
        // au cas où un opérateur a demandé une correction précise, un
        // parcours que cet écran n'expose pas encore. L'employer ici
        // rendrait un 409 sur un dossier fraîchement ouvert.
        return await submitVerification();
      } catch (caught) {
        setError(
          caught instanceof AuthError
            ? caught
            : new AuthError("Une erreur est survenue. Réessayez.", undefined, 0),
        );
        return null;
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  return { busy, error, send };
}
