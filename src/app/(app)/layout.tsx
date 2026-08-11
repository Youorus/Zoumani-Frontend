import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { PropsWithChildren } from "react";

import { AccountShell } from "@/features/account/components/account-shell";
import { callApi } from "@/lib/api/upstream.server";
import {
  stageOf,
  type RawVerification,
} from "@/features/verification/types/verification.types";
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

/*
 * Jamais pré-calculé, jamais mis en cache.
 *
 * Chaque page d'ici dépend de **qui** la demande. Sans cette ligne, la
 * compilation tente de les figer en HTML — sans cookie, donc sans
 * session, et sans API à joindre puisqu'elle ne tourne pas pendant un
 * build. La construction échoue alors sur une page qu'il n'aurait jamais
 * fallu figer.
 *
 * Le pire est qu'elle **réussissait** en développement : l'API tournait
 * sur le poste, la requête aboutissait, et l'on figeait sans le savoir
 * l'espace d'un utilisateur dans un fichier servi à tous.
 */
export const dynamic = "force-dynamic";

export default async function AppGroupLayout({ children }: PropsWithChildren) {
  // Les deux appels partent ensemble : ils ne dépendent pas l'un de
  // l'autre, et les enchaîner doublerait l'attente avant le premier pixel.
  const [me, dossier] = await Promise.all([
    callApi({ method: "GET", path: "/auth/me" }),
    callApi({ method: "GET", path: "/identity-verifications/me" }),
  ]);

  if (me.status === 401) {
    redirect("/connexion?suite=%2Fcompte");
  }
  if (me.status !== 200) {
    throw new Error(`L'API a répondu ${me.status} sur /auth/me.`);
  }

  return (
    <AccountShell
      user={toAuthenticatedUser(me.body as RawCurrentUser)}
      // 404 signifie « rien commencé », pas « erreur » : quelqu'un qui
      // arrive pour la première fois n'a évidemment pas de dossier.
      stage={
        dossier.status === 200
          ? stageOf((dossier.body as RawVerification).status)
          : "absent"
      }
    >
      {children}
    </AccountShell>
  );
}
