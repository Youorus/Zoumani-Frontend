import type { Metadata } from "next";

import { MyTripsView } from "@/features/travel/components/my-trips-view";
import { toTrip, type RawPage, type RawTrip } from "@/features/travel/types/trip.types";
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
  const reponse = await callApi({ method: "GET", path: "/trips" });

  // Une liste vide et une erreur ne se confondent pas : l'écran « aucun
  // trajet » invite à en créer un, ce qui serait absurde après une panne.
  if (reponse.status !== 200) {
    throw new Error(`L'API a répondu ${reponse.status} sur /trips.`);
  }

  const page = reponse.body as RawPage<RawTrip>;
  return <MyTripsView trips={page.items.map(toTrip)} createdTripId={params.nouveau} />;
}
