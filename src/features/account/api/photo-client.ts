"use client";

import { AuthError } from "@/lib/auth/auth-client";
import { toAuthenticatedUser, type RawCurrentUser } from "@/lib/auth/auth.types";

/**
 * La photo de profil, depuis le navigateur.
 *
 * ═══ Le fichier traverse l'API ═══
 *
 * Il existe une route d'envoi direct au stockage, plus rapide pour les
 * gros fichiers. Elle n'est pas employée ici : une photo de profil pèse
 * quelques centaines de kilo-octets, et faire passer le fichier par
 * l'API permet de vérifier son type et sa taille **avant** qu'il
 * n'atteigne le bucket, puis de le rattacher au compte dans la même
 * opération. Un envoi direct laisserait, en cas d'abandon, des objets
 * orphelins que personne ne viendrait purger.
 *
 * ═══ Ce qui revient n'est pas une clé ═══
 *
 * L'API rend le compte à jour, avec une **URL signée** qui expire. La
 * clé de l'objet ne sort jamais : elle ne désigne rien de lisible sans
 * signature, et la persister côté client produirait un lien mort le
 * lendemain (AGENTS.md §6.12).
 */

const BASE = "/api/proxy/users/me/photo";

/** Types acceptés, alignés sur la politique du bucket. */
export const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

/** Au-delà, l'API refuse : autant le dire avant de téléverser. */
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

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

/** Envoie une photo et rend le compte à jour. */
export async function uploadProfilePhoto(file: File) {
  const form = new FormData();
  form.append("file", file);

  const response = await fetch(BASE, { method: "POST", body: form });
  return toAuthenticatedUser((await unwrap(response)) as RawCurrentUser);
}

/** Retire la photo. L'objet est supprimé du stockage. */
export async function removeProfilePhoto() {
  const response = await fetch(BASE, { method: "DELETE" });
  return toAuthenticatedUser((await unwrap(response)) as RawCurrentUser);
}
