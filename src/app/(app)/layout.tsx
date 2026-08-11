import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";

import { AccountShell } from "@/features/account/components/account-shell";
import { callApi } from "@/lib/api/upstream.server";
import { toAuthenticatedUser, type RawCurrentUser } from "@/lib/auth/auth.types";

/**
 * L'espace connecté : contenu personnel, sans valeur pour un moteur de
 * recherche, et qui n'a rien à faire dans un index.
 *
 * ═══ Pourquoi la session est lue ICI ═══
 *
 * Une seule fois pour toutes les pages de l'espace, plutôt qu'une fois
 * par page. L'en-tête a besoin du nom et de la photo à chaque écran : les
 * demander page par page multiplierait les allers-retours pour une
 * réponse identique.
 *
 * `proxy.ts` a déjà écarté les visiteurs sans cookie, mais il ne regarde
 * que sa **présence** — jamais sa validité, qui coûterait un appel réseau
 * à chaque navigation. C'est ici que l'on tranche vraiment.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AppGroupLayout({ children }: PropsWithChildren) {
  const { status, body } = await callApi({ method: "GET", path: "/auth/me" });

  if (status === 401) {
    redirect("/connexion?suite=%2Fcompte");
  }
  if (status !== 200) {
    throw new Error(`L'API a répondu ${status} sur /auth/me.`);
  }

  return (
    <AccountShell user={toAuthenticatedUser(body as RawCurrentUser)}>
      {children}
    </AccountShell>
  );
}
