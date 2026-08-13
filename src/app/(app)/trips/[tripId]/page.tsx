import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TripDetailView } from "@/features/travel/components/trip-detail-view";
import { toCapacity, type RawCapacity } from "@/features/travel/types/travel.types";
import {
  toProof,
  toTrip,
  type RawPage,
  type RawProof,
  type RawTrip,
} from "@/features/travel/types/trip.types";
import { callApi } from "@/lib/api/upstream.server";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;

  // Les trois appels partent ensemble : ils ne dépendent pas les uns des
  // autres, et les enchaîner tripleraient l'attente avant le premier
  // pixel sur une page qui en a besoin de trois.
  const [voyage, offre, preuves] = await Promise.all([
    callApi({ method: "GET", path: `/trips/${tripId}` }),
    callApi({ method: "GET", path: `/trips/${tripId}/capacity` }),
    callApi({ method: "GET", path: `/trips/${tripId}/proofs` }),
  ]);

  // L'API rend le même 404 pour un voyage inexistant et pour celui d'un
  // autre : les distinguer permettrait d'énumérer les voyages d'autrui.
  if (voyage.status === 404) {
    notFound();
  }
  if (voyage.status !== 200) {
    throw new Error(`L'API a répondu ${voyage.status} sur /trips/${tripId}.`);
  }

  return (
    <TripDetailView
      trip={toTrip(voyage.body as RawTrip)}
      // 404 sur l'offre signifie « pas encore créée », pas « erreur ».
      capacity={offre.status === 200 ? toCapacity(offre.body as RawCapacity) : null}
      proofs={
        preuves.status === 200
          ? (preuves.body as RawPage<RawProof>).items.map(toProof)
          : []
      }
    />
  );
}
