"use client";

import { AuthError } from "@/lib/auth/auth-client";

import {
  toRequests,
  toVerification,
  type RawVerification,
  type RawVerificationRequest,
  type Verification,
  type VerificationRequest,
} from "../types/verification.types";

/**
 * Les appels du dossier de vérification, depuis le navigateur.
 *
 * Tous passent par `/api/proxy/…`, donc par le relais de même origine.
 * Le jeton est ajouté côté serveur, à partir d'un cookie que ce code ne
 * peut pas lire : une faille XSS ne permettrait ni de voler la session,
 * ni de lire une pièce d'identité.
 *
 * ═══ Les fichiers ne passent pas par une URL présignée ═══
 *
 * Ils traversent l'API. C'est un choix, et il est délibéré pour **ce**
 * cas : une pièce d'identité doit être confrontée à la politique du
 * bucket et rattachée à un dossier dans la même opération. Un envoi
 * direct laisserait, en cas d'abandon, des pièces d'identité orphelines
 * dans le stockage — ce qu'on ne veut pas avoir à purger.
 */

const RACINE = "/api/proxy/identity-verifications";

/** Tout ce qui concerne **son propre** dossier vit sous `/me`. */
const BASE = `${RACINE}/me`;

async function unwrap(response: Response): Promise<unknown> {
  const payload = (await response.json().catch(() => null)) as {
    error?: { message?: string; details?: { reason?: string; field?: string } };
  } | null;

  if (!response.ok) {
    throw new AuthError(
      payload?.error?.message ?? "Une erreur est survenue.",
      payload?.error?.details?.reason,
      response.status,
      payload?.error?.details?.field,
    );
  }
  return payload;
}

/**
 * Le dossier courant, ou `null` si aucun n'existe.
 *
 * L'API répond 404 tant que rien n'est commencé. On le traduit en `null`
 * plutôt qu'en erreur : ne pas avoir commencé n'est pas un échec, et
 * afficher un message d'erreur à quelqu'un qui arrive pour la première
 * fois serait absurde.
 */
export async function fetchVerification(): Promise<Verification | null> {
  const response = await fetch(BASE, { cache: "no-store" });
  if (response.status === 404) {
    return null;
  }
  return toVerification((await unwrap(response)) as RawVerification);
}

/**
 * Ouvre un dossier.
 *
 * Sur la racine, pas sur `/me` : ouvrir n'est pas une action *sur* son
 * dossier — il n'en existe pas encore — mais la création d'une ressource.
 *
 * Répond 409 si un dossier vivant existe déjà. On l'avale : l'appelant
 * veut « qu'un dossier existe », et il en existe un.
 */
export async function startVerification(): Promise<void> {
  const response = await fetch(RACINE, { method: "POST" });
  if (response.status === 409) {
    return;
  }
  await unwrap(response);
}

export interface IdentityDraft {
  legalFirstName: string;
  legalLastName: string;
  dateOfBirth: string;
  nationality: string;
  countryOfResidence: string;
  residentialAddress: string;
}

/** Enregistre les informations déclarées, sans transmettre le dossier. */
export async function saveDraft(draft: IdentityDraft): Promise<Verification> {
  const response = await fetch(BASE, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      legal_first_name: draft.legalFirstName,
      legal_last_name: draft.legalLastName,
      date_of_birth: draft.dateOfBirth,
      nationality: draft.nationality,
      country_of_residence: draft.countryOfResidence,
      residential_address: draft.residentialAddress,
    }),
  });
  return toVerification((await unwrap(response)) as RawVerification);
}

/** Dépose une pièce d'identité. Le verso est facultatif — pas pour tous. */
export async function uploadDocument(input: {
  documentType: "passport" | "national_id" | "residence_permit";
  front: File;
  back?: File | null;
  issuingCountry: string;
  expiresOn?: string;
}): Promise<void> {
  const form = new FormData();
  form.append("document_type", input.documentType);
  form.append("front", input.front);
  // Obligatoire côté API : un passeport camerounais et un passeport
  // français n'ont ni la même durée de validité ni les mêmes contrôles.
  form.append("issuing_country", input.issuingCountry);
  if (input.back) {
    form.append("back", input.back);
  }
  if (input.expiresOn) {
    form.append("expires_on", input.expiresOn);
  }
  await unwrap(await fetch(`${BASE}/documents`, { method: "POST", body: form }));
}

/** Dépose la photo de la personne tenant sa pièce. */
export async function uploadSelfie(photo: File): Promise<void> {
  const form = new FormData();
  form.append("front", photo);
  await unwrap(await fetch(`${BASE}/selfie`, { method: "POST", body: form }));
}

/**
 * Transmet le dossier pour examen.
 *
 * Il existe aussi `resubmit`, réservé au cas où un opérateur a demandé
 * une correction précise sur un dossier qu'il a gardé sous la main. Cet
 * écran n'expose pas encore ce parcours-là ; l'employer sur un dossier
 * fraîchement ouvert rendrait un 409 que rien n'expliquerait.
 */
export async function submitVerification(): Promise<Verification> {
  const response = await fetch(`${BASE}/submit`, { method: "POST" });
  return toVerification((await unwrap(response)) as RawVerification);
}

/** Les demandes de correction adressées à la personne. */
export async function fetchRequests(): Promise<VerificationRequest[]> {
  const response = await fetch(`${BASE}/requests`, { cache: "no-store" });
  if (!response.ok) {
    return [];
  }
  return toRequests((await response.json()) as RawVerificationRequest[]);
}

/** Répond à une demande. L'explication est facultative. */
export async function respondToRequest(
  requestId: string,
  message: string,
): Promise<void> {
  await unwrap(
    await fetch(`${BASE}/requests/${requestId}/respond`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ response: message || null }),
    }),
  );
}

/**
 * Remplace une pièce que l'opérateur a jugée inexploitable.
 *
 * L'ancienne n'est pas effacée : elle devient une version précédente.
 * Un examen doit pouvoir montrer ce qui avait été envoyé la première
 * fois — c'est ce qui distingue une correction d'une réécriture.
 */
export async function replaceDocument(
  documentId: string,
  input: {
    documentType: string;
    front: File;
    back?: File | null;
    issuingCountry?: string;
    expiresOn?: string;
  },
): Promise<void> {
  const form = new FormData();
  // Exigé même pour un remplacement : rien n'interdit de remplacer une
  // carte d'identité par un passeport, et le serveur ne le devine pas.
  form.append("document_type", input.documentType);
  form.append("front", input.front);
  if (input.back) {
    form.append("back", input.back);
  }
  // Le selfie n'a pas de pays émetteur — l'envoyer le ferait refuser.
  if (input.issuingCountry) {
    form.append("issuing_country", input.issuingCountry);
  }
  if (input.expiresOn) {
    form.append("expires_on", input.expiresOn);
  }
  await unwrap(
    await fetch(`${BASE}/documents/${documentId}/replace`, {
      method: "POST",
      body: form,
    }),
  );
}

/**
 * Renvoie le dossier après correction.
 *
 * `resubmit` et non `submit` : le dossier existe, il est simplement
 * revenu vers la personne. Ouvrir un nouveau dossier ici perdrait
 * l'échange avec l'opérateur, qui est précisément ce qui permet de
 * comprendre pourquoi il revient.
 */
export async function resubmitVerification(): Promise<Verification> {
  const response = await fetch(`${BASE}/resubmit`, { method: "POST" });
  return toVerification((await unwrap(response)) as RawVerification);
}


/**
 * Les pièces du dossier, avec leur nature.
 *
 * Nécessaire pour une correction : une demande « reprenez votre photo »
 * ne vise aucune pièce au sens du serveur. C'est au client de retrouver
 * le selfie déjà déposé, faute de quoi on en ajouterait un second au lieu
 * de corriger le premier.
 */
export async function fetchDocuments(): Promise<{ id: string; documentType: string }[]> {
  const response = await fetch(`${BASE}/documents`, { cache: "no-store" });
  if (!response.ok) {
    return [];
  }
  const payload = (await response.json()) as {
    documents: { id: string; document_type: string }[];
  };
  return payload.documents.map((doc) => ({ id: doc.id, documentType: doc.document_type }));
}
