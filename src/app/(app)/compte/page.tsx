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

/** L'accueil de l'espace personnel, alimenté par les seuls agrégats métier. */
export const metadata: Metadata = {
  title: "Votre espace",
  robots: { index: false, follow: false },
};

export default async function ComptePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [dossier, tripsResponse, rewardsResponse, params] = await Promise.all([
    callApi({ method: "GET", path: "/identity-verifications/me" }),
    callApi({ method: "GET", path: "/trips" }),
    callApi({ method: "GET", path: "/rewards/me" }),
    searchParams,
  ]);

  const trips =
    tripsResponse.status === 200
      ? (tripsResponse.body as RawPage<RawTrip>).items.map(toTrip)
      : null;

  return (
    <AccountHome
      verificationStage={
        dossier.status === 200
          ? stageOf((dossier.body as RawVerification).status)
          : dossier.status === 404
            ? "absent"
            : null
      }
      trips={trips}
      rewards={
        rewardsResponse.status === 200
          ? toRewards(rewardsResponse.body as RawRewards)
          : null
      }
      // Posé par le parcours d'accès quand il vient de créer le compte.
      welcome={params.bienvenue === "1"}
    />
  );
}
