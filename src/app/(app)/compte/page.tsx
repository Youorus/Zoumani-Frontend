import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AccountOverview } from "@/features/account/components/account-overview";
import { callApi } from "@/lib/api/upstream.server";
import { toAuthenticatedUser, type RawCurrentUser } from "@/lib/auth/auth.types";

/**
 * L'espace personnel — là où mène la connexion.
 *
 * ═══ Pourquoi un composant serveur ═══
 *
 * La page est rendue avec les données déjà présentes. Un équivalent
 * client afficherait d'abord un squelette, puis le nom : quelqu'un qui
 * vient de franchir deux barrières verrait clignoter l'écran d'arrivée,
 * au moment précis où il attend une confirmation que tout a marché.
 *
 * ═══ Pourquoi ce contrôle, alors que `proxy.ts` protège déjà ═══
 *
 * `proxy.ts` ne regarde que la **présence** d'un cookie, jamais sa
 * validité — la valider à chaque navigation coûterait un aller-retour
 * réseau par page. Un cookie périmé ou forgé passe donc son filtre. Ici,
 * l'API répond 401 et l'on renvoie vers la connexion. Les deux contrôles
 * ne font pas double emploi : le premier évite d'afficher une page vide,
 * le second est celui qui décide.
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
  const { status, body } = await callApi({ method: "GET", path: "/auth/me" });

  if (status === 401) {
    // La destination est conservée : après reconnexion, on revient ici
    // plutôt que sur un accueil générique.
    redirect("/connexion?suite=%2Fcompte");
  }
  if (status !== 200) {
    throw new Error(`L'API a répondu ${status} sur /auth/me.`);
  }

  const params = await searchParams;

  return (
    <AccountOverview
      user={toAuthenticatedUser(body as RawCurrentUser)}
      // Posé par le parcours d'accès quand il vient de **créer** le
      // compte. Le serveur ne le dit pas — et n'a pas à le dire : c'est
      // le client qui sait s'il est passé par l'écran d'inscription.
      welcome={params.bienvenue === "1"}
    />
  );
}
