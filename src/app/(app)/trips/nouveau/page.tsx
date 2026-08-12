import type { Metadata } from "next";

import { CreateTripView } from "@/features/travel/components/create-trip-view";
import {
  stageOf,
  type RawVerification,
} from "@/features/verification/types/verification.types";
import { callApi } from "@/lib/api/upstream.server";

/*
 * Aucun titre traduit ici : `metadata` est calculée côté serveur, sans
 * accès à la langue du compte, qui vit dans un contexte de rendu.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/*
 * Jamais figée : l'écran dépend de l'état du dossier d'identité de qui
 * la demande. Voir le layout du groupe pour le détail.
 */
export const dynamic = "force-dynamic";

export default async function Page() {
  const dossier = await callApi({
    method: "GET",
    path: "/identity-verifications/me",
  });

  // 404 signifie « rien commencé », pas « erreur ».
  const stage =
    dossier.status === 200 ? stageOf((dossier.body as RawVerification).status) : "absent";

  return <CreateTripView stage={stage} />;
}
