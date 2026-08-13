import type { Metadata } from "next";

import { RewardsView } from "@/features/travel/components/rewards-view";
import { toRewards, type RawRewards } from "@/features/travel/types/trip.types";
import { callApi } from "@/lib/api/upstream.server";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const reponse = await callApi({ method: "GET", path: "/rewards/me" });

  if (reponse.status !== 200) {
    throw new Error(`L'API a répondu ${reponse.status} sur /rewards/me.`);
  }

  return <RewardsView rewards={toRewards(reponse.body as RawRewards)} />;
}
