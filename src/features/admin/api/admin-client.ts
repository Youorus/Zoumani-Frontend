"use client";

import { AuthError } from "@/lib/auth/auth-client";

/**
 * Les appels de l'espace d'administration.
 *
 * Tous passent par le relais de même origine : le jeton reste dans un
 * cookie `httpOnly`, et les URL de lecture des pièces d'identité sont des
 * liens signés à durée limitée, calculés par l'API à chaque requête.
 *
 * ═══ Aucune règle d'autorisation ici ═══
 *
 * Ce fichier ne vérifie rien. L'API refuse tout appel sans la permission
 * correspondante, et c'est **le seul** contrôle qui compte : ce que fait
 * l'interface, c'est éviter d'afficher des boutons qui répondraient 403.
 * Redoubler la règle côté client en produirait une seconde version, et
 * les deux finiraient par diverger.
 */

const BASE = "/api/proxy/admin/identity-verifications";

export type AdminVerificationStatus =
  | "submitted"
  | "under_review"
  | "action_required"
  | "resubmitted"
  | "verified"
  | "rejected";

export type AdminRequestKind =
  | "replace_document"
  | "add_document"
  | "retake_selfie"
  | "provide_information"
  | "correct_information";

async function unwrap(response: Response): Promise<unknown> {
  const payload = (await response.json().catch(() => null)) as {
    error?: { message?: string; details?: { reason?: string } };
  } | null;

  if (!response.ok) {
    throw new AuthError(
      payload?.error?.message ?? "Une erreur est survenue.",
      payload?.error?.details?.reason,
      response.status,
    );
  }
  return payload;
}

export interface AdminDocument {
  id: string;
  document_type: string;
  status: string;
  issuing_country: string | null;
  expires_on: string | null;
  front_url: string;
  back_url: string | null;
  rejection_reason: string | null;
  version: number;
  replaces_id: string | null;
}

export interface AdminVerification {
  id: string;
  user_id: string;
  status: AdminVerificationStatus;
  legal_first_name: string | null;
  legal_last_name: string | null;
  date_of_birth: string | null;
  nationality: string | null;
  country_of_residence: string | null;
  residential_address: string | null;
  rejection_reason: string | null;
  submitted_at: string | null;
}

export interface AdminDetail {
  verification: AdminVerification;
  documents: AdminDocument[];
  requests: AdminRequest[];
  events: AdminEvent[];
}

export interface AdminRequest {
  id: string;
  kind: AdminRequestKind;
  status: "pending" | "answered" | "resolved" | "cancelled";
  message: string;
  document_id: string | null;
  user_response: string | null;
  created_at: string;
  responded_at: string | null;
}

export interface AdminEvent {
  id: string;
  kind: string;
  occurred_at: string;
  previous_status: string | null;
  new_status: string | null;
}

/** La file d'examen, filtrée par statut. */
export async function listVerifications(status?: string): Promise<AdminVerification[]> {
  const query = status ? `?status=${status}` : "";
  const payload = (await unwrap(
    await fetch(`${BASE}${query}`, { cache: "no-store" }),
  )) as { items: AdminVerification[] };
  return payload.items;
}

/** Un dossier complet : ses informations, ses pièces, ses échanges. */
export async function getVerification(id: string): Promise<AdminDetail> {
  const [detail, events] = await Promise.all([
    unwrap(await fetch(`${BASE}/${id}`, { cache: "no-store" })) as Promise<
      Omit<AdminDetail, "events">
    >,
    unwrap(await fetch(`${BASE}/${id}/events`, { cache: "no-store" })) as Promise<
      AdminEvent[]
    >,
  ]);
  return { ...detail, events };
}

/**
 * Prend le dossier en charge.
 *
 * Obligatoire avant toute décision : la machine à états du serveur
 * l'exige, et ce n'est pas une formalité — c'est ce qui empêche deux
 * opérateurs d'examiner le même dossier en même temps et de se
 * contredire.
 */
export async function startReview(id: string): Promise<void> {
  await unwrap(await fetch(`${BASE}/${id}/start-review`, { method: "POST" }));
}

export async function acceptDocument(id: string, documentId: string): Promise<void> {
  await unwrap(
    await fetch(`${BASE}/${id}/documents/${documentId}/accept`, { method: "POST" }),
  );
}

export async function rejectDocument(
  id: string,
  documentId: string,
  reason: string,
): Promise<void> {
  await unwrap(
    await fetch(`${BASE}/${id}/documents/${documentId}/reject`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ reason }),
    }),
  );
}

/** Valide le dossier. Toutes les pièces doivent avoir été statuées. */
export async function approve(id: string): Promise<void> {
  await unwrap(await fetch(`${BASE}/${id}/approve`, { method: "POST" }));
}

/** Refuse le dossier. Le motif part dans l'e-mail — il sera lu. */
export async function reject(id: string, reason: string): Promise<void> {
  await unwrap(
    await fetch(`${BASE}/${id}/reject`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ reason }),
    }),
  );
}

/** Demande une correction précise sans refuser le dossier. */
export async function requestAction(
  id: string,
  kind: AdminRequestKind,
  message: string,
  documentId?: string,
): Promise<void> {
  await unwrap(
    await fetch(`${BASE}/${id}/request-action`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        kind,
        message,
        ...(documentId ? { document_id: documentId } : {}),
      }),
    }),
  );
}
