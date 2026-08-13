import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EditItineraryView } from "@/features/travel/components/edit-itinerary-view";
import { toTrip, type RawTrip } from "@/features/travel/types/trip.types";
import { callApi } from "@/lib/api/upstream.server";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const reponse = await callApi({ method: "GET", path: `/trips/${tripId}` });

  // L'API rend le même 404 pour un voyage inexistant et pour celui d'un
  // autre : la distinction permettrait d'énumérer les voyages d'autrui.
  if (reponse.status === 404) {
    notFound();
  }
  if (reponse.status !== 200) {
    throw new Error(`L'API a répondu ${reponse.status} sur /trips/${tripId}.`);
  }

  return <EditItineraryView trip={toTrip(reponse.body as RawTrip)} />;
}
