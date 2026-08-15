import type { Metadata } from "next";

import { JourneysView } from "@/features/tracking/components/journeys-view";
import { toJourney, type RawJourney } from "@/features/tracking/types/tracking.types";
import { callApi } from "@/lib/api/upstream.server";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const reponse = await callApi({ method: "GET", path: "/journeys" });

  if (reponse.status !== 200) {
    throw new Error(`L'API a répondu ${reponse.status} sur /journeys.`);
  }

  return <JourneysView journeys={(reponse.body as RawJourney[]).map(toJourney)} />;
}
