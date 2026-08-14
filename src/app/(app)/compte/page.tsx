import type { Metadata } from "next";

import { AccountHome } from "@/features/account/components/account-home";
import {
  toRewards,
  toTrip,
  type RawPage,
  type RawRewards,
  type RawTrip,
} from "@/features/travel/types/trip.types";
import {
  stageOf,
  type RawVerification,
} from "@/features/verification/types/verification.types";
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
  const [me, dossier, tripsResponse, rewardsResponse, params] = await Promise.all([
    callApi({ method: "GET", path: "/auth/me" }),
    callApi({ method: "GET", path: "/identity-verifications/me" }),
    callApi({ method: "GET", path: "/trips" }),
    callApi({ method: "GET", path: "/rewards/me" }),
    searchParams,
  ]);

  if (me.status !== 200) {
    throw new Error(`L'API a répondu ${me.status} sur /auth/me.`);
  }
  if (dossier.status !== 200 && dossier.status !== 404) {
    throw new Error(
      `L'API a répondu ${dossier.status} sur /identity-verifications/me.`,
    );
  }
  if (tripsResponse.status !== 200) {
    throw new Error(`L'API a répondu ${tripsResponse.status} sur /trips.`);
  }
  if (rewardsResponse.status !== 200) {
    throw new Error(`L'API a répondu ${rewardsResponse.status} sur /rewards/me.`);
  }

  const trips = tripsResponse.body as RawPage<RawTrip>;

  return (
    <AccountHome
      user={toAuthenticatedUser(me.body as RawCurrentUser)}
      verificationStage={
        dossier.status === 200
          ? stageOf((dossier.body as RawVerification).status)
          : "absent"
      }
      trips={trips.items.map(toTrip)}
      rewards={toRewards(rewardsResponse.body as RawRewards)}
      // Posé par le parcours d'accès quand il vient de créer le compte.
      welcome={params.bienvenue === "1"}
    />
  );
}
