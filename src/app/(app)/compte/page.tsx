import type { Metadata } from "next";

import { AccountHome } from "@/features/account/components/account-home";
import { callApi } from "@/lib/api/upstream.server";
import { toAuthenticatedUser, type RawCurrentUser } from "@/lib/auth/auth.types";

/**
 * L'accueil de l'espace personnel.
 *
 * La session est relue ici bien que le gabarit l'ait déjà fait : Next
 * rend les deux en parallèle et ne transmet rien de l'un à l'autre. La
 * seconde lecture ne coûte rien de plus en pratique — la réponse est
 * identique et le jeton n'est pas re-négocié.
 */
export const metadata: Metadata = {
  title: "Votre espace",
  robots: { index: false, follow: false },
};

export default async function ComptePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ body }, params] = await Promise.all([
    callApi({ method: "GET", path: "/auth/me" }),
    searchParams,
  ]);

  return (
    <AccountHome
      user={toAuthenticatedUser(body as RawCurrentUser)}
      // Posé par le parcours d'accès quand il vient de créer le compte.
      welcome={params.bienvenue === "1"}
    />
  );
}
