import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JourneyDetailView } from "@/features/tracking/components/journey-detail-view";
import { toJourney, type RawJourney } from "@/features/tracking/types/tracking.types";
import { callApi } from "@/lib/api/upstream.server";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ journeyId: string }>;
}) {
  const { journeyId } = await params;
  const reponse = await callApi({ method: "GET", path: `/journeys/${journeyId}` });

  // 404 comme 403 : l'API rend « introuvable » dans les deux cas, et
  // l'interface ne doit pas inventer une distinction que le serveur
  // refuse délibérément de faire.
  if (reponse.status === 404 || reponse.status === 403) {
    notFound();
  }
  if (reponse.status !== 200) {
    throw new Error(`L'API a répondu ${reponse.status} sur /journeys.`);
  }

  return <JourneyDetailView initial={toJourney(reponse.body as RawJourney)} />;
}
