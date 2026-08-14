import type { Metadata } from "next";

import { MyTripsView } from "@/features/travel/components/my-trips-view";
import {
  toRewards,
  toTrip,
  type RawPage,
  type RawRewards,
  type RawTrip,
} from "@/features/travel/types/trip.types";
import { callApi } from "@/lib/api/upstream.server";

/*
 * Aucun titre traduit ici : `metadata` est calculée côté serveur, sans
 * accès à la langue du compte, qui vit dans un contexte de rendu.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ nouveau?: string }>;
}) {
  const params = await searchParams;
  const [reponse, rewardsResponse] = await Promise.all([
    callApi({ method: "GET", path: "/trips" }),
    callApi({ method: "GET", path: "/rewards/me" }),
  ]);

  // Une liste vide et une erreur ne se confondent pas : l'écran « aucun
  // trajet » invite à en créer un, ce qui serait absurde après une panne.
  if (reponse.status !== 200) {
    throw new Error(`L'API a répondu ${reponse.status} sur /trips.`);
  }
  if (rewardsResponse.status !== 200) {
    throw new Error(
      `L'API a répondu ${rewardsResponse.status} sur /rewards/me.`,
    );
  }

  const page = reponse.body as RawPage<RawTrip>;
  const rewards = toRewards(rewardsResponse.body as RawRewards);
  return (
    <MyTripsView
      trips={page.items.map(toTrip)}
      createdTripId={params.nouveau}
      cancellationPenalty={Math.abs(rewards.earningRules.commitment_broken ?? 0)}
    />
  );
}
