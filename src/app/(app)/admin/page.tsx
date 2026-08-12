import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ReviewQueue } from "@/features/admin/components/review-queue";
import { callApi } from "@/lib/api/upstream.server";
import { toAuthenticatedUser, type RawCurrentUser } from "@/lib/auth/auth.types";

/**
 * L'espace d'administration.
 *
 * ═══ Pourquoi le contrôle a lieu ici ET côté API ═══
 *
 * Ce test-ci évite d'afficher un écran dont tous les boutons
 * répondraient 403 — c'est du confort, pas de la sécurité. Le contrôle
 * qui décide vraiment est celui de l'API, sur chaque appel, et il n'est
 * pas contournable : quelqu'un qui forcerait cette page n'obtiendrait
 * qu'une file vide et des refus.
 *
 * ═══ Aucune permission n'est écrite en dur ici ═══
 *
 * On regarde si la personne en détient **au moins une** du domaine des
 * vérifications. Lister les permissions exactes reviendrait à
 * réimplémenter côté client la politique d'accès du serveur, et les deux
 * divergeraient au premier ajustement.
 */
export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const { status, body } = await callApi({ method: "GET", path: "/auth/me" });

  if (status === 401) {
    redirect("/connexion?suite=%2Fadmin");
  }

  const user = toAuthenticatedUser(body as RawCurrentUser);
  const operateur = user.permissions.some((permission) =>
    permission.startsWith("identity_verifications:"),
  );

  if (!operateur) {
    // Vers son espace, pas vers une page d'erreur : quelqu'un sans droits
    // n'a rien fait de mal, il s'est simplement trompé d'adresse.
    redirect("/compte");
  }

  return <ReviewQueue />;
}
