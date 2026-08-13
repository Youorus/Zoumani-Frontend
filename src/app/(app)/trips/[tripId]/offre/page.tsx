import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EditCapacityView } from "@/features/travel/components/edit-capacity-view";
import { toCapacity, type RawCapacity } from "@/features/travel/types/travel.types";
import { callApi } from "@/lib/api/upstream.server";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;

  const [voyage, offre] = await Promise.all([
    callApi({ method: "GET", path: `/trips/${tripId}` }),
    callApi({ method: "GET", path: `/trips/${tripId}/capacity` }),
  ]);

  // Le voyage est lu d'abord pour distinguer « ce voyage n'est pas à
  // vous » d'« il ne porte pas encore d'offre » : le second est un état
  // normal, pas une erreur.
  if (voyage.status === 404) {
    notFound();
  }
  if (voyage.status !== 200) {
    throw new Error(`L'API a répondu ${voyage.status} sur /trips/${tripId}.`);
  }

  return (
    <EditCapacityView
      tripId={tripId}
      capacity={offre.status === 200 ? toCapacity(offre.body as RawCapacity) : null}
    />
  );
}
