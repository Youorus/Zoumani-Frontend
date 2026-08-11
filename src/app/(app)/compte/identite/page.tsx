import type { Metadata } from "next";

import { accountLanguage } from "@/features/account/lib/account-language";
import { VerificationView } from "@/features/verification/components/verification-view";
import {
  toRequests,
  toVerification,
  type RawVerification,
  type RawVerificationRequest,
} from "@/features/verification/types/verification.types";
import { callApi } from "@/lib/api/upstream.server";
import { toAuthenticatedUser, type RawCurrentUser } from "@/lib/auth/auth.types";

/**
 * La vérification d'identité.
 *
 * Le dossier est lu **côté serveur** : l'écran s'affiche déjà rempli,
 * avec le bon état. Un chargement client montrerait d'abord un formulaire
 * vierge à quelqu'un dont le dossier est déjà en cours d'examen — et
 * l'inviterait à tout ressaisir pour rien.
 */
export const metadata: Metadata = {
  title: "Vérification d'identité",
  robots: { index: false, follow: false },
};

export default async function IdentitePage() {
  const [me, dossier, demandes] = await Promise.all([
    callApi({ method: "GET", path: "/auth/me" }),
    callApi({ method: "GET", path: "/identity-verifications/me" }),
    // Chargées d'emblée : ce sont elles qui décident de l'écran affiché,
    // et les demander après aurait montré l'attente une fraction de
    // seconde avant de la remplacer par une demande de correction.
    callApi({ method: "GET", path: "/identity-verifications/me/requests" }),
  ]);

  const user = toAuthenticatedUser(me.body as RawCurrentUser);

  return (
    <div className="mx-auto w-full max-w-[1492px] px-4 sm:px-8 lg:px-12">
      <VerificationView
        // 404 signifie « rien commencé », pas « erreur ».
        verification={
          dossier.status === 200 ? toVerification(dossier.body as RawVerification) : null
        }
        requests={
          demandes.status === 200
            ? toRequests(demandes.body as RawVerificationRequest[])
            : []
        }
        language={accountLanguage(user.preferredLanguage)}
      />
    </div>
  );
}
